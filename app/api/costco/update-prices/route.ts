import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getSearchQuery } from "@/lib/costco-mappings"
import { authenticateAdmin } from '@/lib/auth'

/**
 * Fetches current price for a product from Google Shopping via Serper.dev
 * Only accepts prices from Costco.com or Kirkland-branded sources
 */
async function fetchPriceFromSerper(searchQuery: string): Promise<{
  price: number | null
  source: string
  error?: string
}> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    return { price: null, source: "serper", error: "SERPER_API_KEY not configured" }
  }

  try {
    const res = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: "us",
        hl: "en",
        num: 5,
      }),
    })

    if (!res.ok) {
      return { price: null, source: "serper", error: `HTTP ${res.status}: ${res.statusText}` }
    }

    const data = await res.json()
    const shopping = data.shopping || []
    
    if (shopping.length === 0) {
      return { price: null, source: "serper", error: "No shopping results found" }
    }

    // Only accept prices from costco.com or Kirkland sources
    const costcoResult = shopping.find((item: any) => {
      const src = (item.source || item.title || item.link || "").toLowerCase()
      return src.includes("costco") || src.includes("kirkland")
    })
    
    if (!costcoResult) {
      return { price: null, source: "serper", error: "No Costco-specific price found" }
    }

    // Extract price — could be "$14.99" or "From $12.99"
    const priceStr = costcoResult.price || costcoResult.extractedPrice || ""
    const priceMatch = priceStr.toString().match(/\$?(\d+\.?\d*)/)
    const price = priceMatch ? parseFloat(priceMatch[1]) : null

    return {
      price,
      source: costcoResult.source || "Costco",
    }
  } catch (e: any) {
    return { price: null, source: "serper", error: e.message }
  }
}

/**
 * Recalculate cost_per_serving for a menu item based on its ingredient_list prices
 */
function recalculateCost(ingredientList: any[]): { costPerServing: number; totalIngredientCost: number } {
  const totalCost = ingredientList.reduce((sum: number, ing: any) => {
    // Use Costco price if available, then WinCo, then Sam's, then 0
    const price = ing.costcoPrice ?? ing.wincoPrice ?? ing.samsClubPrice ?? 0
    return sum + price
  }, 0)

  return {
    costPerServing: Math.round(totalCost * 100) / 100,
    totalIngredientCost: Math.round(totalCost * 100) / 100,
  }
}

/**
 * POST /api/costco/update-prices
 * Fetches current Costco prices via Serper.dev Google Shopping API
 * and updates all menu_items ingredient lists with new prices.
 */
export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "SERPER_API_KEY not configured. Add it to .env.local",
      action: 'Add to .env.local: SERPER_API_KEY=your_key_from_serper.dev',
    }, { status: 400 })
  }

  try {
    // Fetch all menu_items with their ingredient lists
    const { data: items, error: fetchError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, ingredient_list, ingredient_links, cost_per_serving, suggested_menu_price")

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ status: "ok", message: "No menu items found" })
    }

    // Collect unique ingredient names across all items
    const ingredientPriceCache = new Map<string, number | null>()
    const ingredientFailures = new Set<string>()

    for (const item of items) {
      let list = item.ingredient_list
      if (typeof list === "string") try { list = JSON.parse(list) } catch { list = [] }
      if (!Array.isArray(list)) continue

      for (const ing of list) {
        const name = ing.item?.trim()
        if (!name || ingredientPriceCache.has(name) || ingredientFailures.has(name)) continue
        ingredientPriceCache.set(name, null) // Mark as processing
      }
    }

    // Fetch prices for each unique ingredient
    const results: {
      ingredient: string
      searchQuery: string
      price: number | null
      source: string
      error?: string
    }[] = []

    const entries = Array.from(ingredientPriceCache.entries())
    
    // Fetch prices in parallel batches to stay under Vercel's 10s timeout
    const BATCH_SIZE = 5
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(
        batch.map(async ([ingredientName]) => {
          const searchQuery = getSearchQuery(ingredientName)
          const result = await fetchPriceFromSerper(searchQuery)
          return { ingredient: ingredientName, searchQuery, ...result }
        })
      )
      
      for (const r of batchResults) {
        results.push(r)
        if (r.price !== null) {
          ingredientPriceCache.set(r.ingredient, r.price)
        } else {
          ingredientFailures.add(r.ingredient)
        }
      }
    }

    // Update each menu_item's ingredient_list with new prices
    let updatedCount = 0
    let updatedItemIds: string[] = []

    for (const item of items) {
      let list = item.ingredient_list
      if (typeof list === "string") try { list = JSON.parse(list) } catch { list = [] }
      if (!Array.isArray(list) || list.length === 0) continue

      let changed = false

      const updatedList = list.map((ing: any) => {
        const name = ing.item?.trim()
        const newPrice = ingredientPriceCache.get(name)
        if (newPrice !== undefined && newPrice !== null && ing.costcoPrice !== newPrice) {
          changed = true
          return { ...ing, costcoPrice: newPrice }
        }
        return ing
      })

      if (!changed) continue

      // Recalculate cost_per_serving
      const { costPerServing } = recalculateCost(updatedList)
      const currentCost = item.cost_per_serving || 0

      if (costPerServing === currentCost) continue

      // Update ingredient_links with new aggregated data
      let links = item.ingredient_links
      if (typeof links === "string") try { links = JSON.parse(links) } catch { links = {} }
      if (!links || typeof links !== "object") links = {}

      links.costco = {
        costPerServing,
        totalFor150: Math.round(costPerServing * 150 * 100) / 100,
        lastUpdated: new Date().toISOString().split("T")[0],
      }

      await supabaseAdmin
        .from("menu_items")
        .update({
          ingredient_list: updatedList,
          ingredient_links: links,
          cost_per_serving: costPerServing,
          last_priced_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", item.id)

      updatedCount++
      updatedItemIds.push(item.id)
    }

    // Also update any buffet_items that have ingredient_lists
    const { data: buffetItems } = await supabaseAdmin
      .from("buffet_items")
      .select("id, name, ingredient_list, ingredient_links, cost_per_serving, price_per_person")

    // First, add buffet ingredient names to the search cache if not already there
    if (buffetItems) {
      for (const item of buffetItems) {
        let list = item.ingredient_list
        if (typeof list === "string") try { list = JSON.parse(list) } catch { list = [] }
        if (!Array.isArray(list)) continue
        for (const ing of list) {
          const name = ing.item?.trim()
          if (name && !ingredientPriceCache.has(name) && !ingredientFailures.has(name)) {
            ingredientPriceCache.set(name, null)
          }
        }
      }
    }

    // Search for any newly added buffet ingredient names
    const newEntries = Array.from(ingredientPriceCache.entries()).filter(([, v]) => v === null)
    if (newEntries.length > 0) {
      for (let i = 0; i < newEntries.length; i += BATCH_SIZE) {
        const batch = newEntries.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.all(
          batch.map(async ([ingredientName]) => {
            const searchQuery = getSearchQuery(ingredientName)
            const result = await fetchPriceFromSerper(searchQuery)
            return { ingredient: ingredientName, searchQuery, ...result }
          })
        )
        for (const r of batchResults) {
          results.push(r)
          if (r.price !== null) {
            ingredientPriceCache.set(r.ingredient, r.price)
          } else {
            ingredientFailures.add(r.ingredient)
          }
        }
      }
    }

    let buffetUpdatedCount = 0
    if (buffetItems) {
      for (const item of buffetItems) {
        let list = item.ingredient_list
        if (typeof list === "string") try { list = JSON.parse(list) } catch { list = [] }
        if (!Array.isArray(list) || list.length === 0) continue

        let changed = false
        const updatedList = list.map((ing: any) => {
          const name = ing.item?.trim()
          const newPrice = ingredientPriceCache.get(name)
          if (newPrice !== undefined && newPrice !== null && ing.costcoPrice !== newPrice) {
            changed = true
            return { ...ing, costcoPrice: newPrice }
          }
          return ing
        })

        if (!changed) continue

        const { costPerServing } = recalculateCost(updatedList)
        const currentCost = item.cost_per_serving || 0
        if (costPerServing === currentCost) continue

        let links = item.ingredient_links
        if (typeof links === "string") try { links = JSON.parse(links) } catch { links = {} }
        if (!links || typeof links !== "object") links = {}

        links.costco = {
          costPerServing,
          totalFor150: Math.round(costPerServing * 150 * 100) / 100,
          lastUpdated: new Date().toISOString().split("T")[0],
        }

        await supabaseAdmin
          .from("buffet_items")
          .update({
            ingredient_list: updatedList,
            ingredient_links: links,
            cost_per_serving: costPerServing,
          })
          .eq("id", item.id)

        buffetUpdatedCount++
      }
    }

    // Summary
    const successful = results.filter(r => r.price !== null)
    const failed = results.filter(r => r.price === null)

    return NextResponse.json({
      status: "complete",
      summary: {
        ingredientsChecked: results.length,
        pricesFound: successful.length,
        pricesFailed: failed.length,
        menuItemsUpdated: updatedCount,
        buffetItemsUpdated: buffetUpdatedCount,
      },
      failures: failed.map(f => ({ ingredient: f.ingredient, error: f.error })),
      results: successful.map(r => ({ ingredient: r.ingredient, price: r.price, source: r.source })),
      note: "Price updates are from Google Shopping. For exact in-store pricing, verify at your local Costco.",
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}