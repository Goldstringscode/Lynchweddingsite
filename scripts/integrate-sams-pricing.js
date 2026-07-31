/**
 * Integrate Sam's Club Pricing into Database
 * 
 * Maps the researched Sam's Club ingredient prices to actual menu items
 * in the Supabase database, updating ingredient_list and ingredient_links.
 * 
 * Usage: node scripts/integrate-sams-pricing.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://asnkchxmqanvdljzgshv.supabase.co'
const SUPABASE_KEY = '[REDACTED]'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Load Sam's Club pricing research
const pricingResearch = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'scout', 'sams-club-pricing-research.json'), 'utf-8')
)

// Build a lookup map: keyword -> ingredient price info
function buildPriceLookup(ingredients) {
  const lookup = {}
  const allIngredients = Object.values(ingredients).flat()
  
  for (const ing of allIngredients) {
    // Index by full item name (lowercase)
    lookup[ing.itemName.toLowerCase()] = ing
    
    // Also index by first meaningful keyword
    const words = ing.itemName.toLowerCase().split(/[,\s(]+/)
    for (const word of words) {
      if (word.length > 3 && !['the', 'and', 'with', 'for', 'fresh', 'frozen', 'organic', 'bulk', 'package', 'case', 'per', 'lb', 'oz', 'each'].includes(word)) {
        // Don't overwrite longer matches
        if (!lookup[word] || lookup[word].itemName.length < ing.itemName.length) {
          lookup[word] = ing
        }
      }
    }
  }
  return lookup
}

function findBestPrice(itemName, ingredientList, priceLookup) {
  const name = (itemName || '').toLowerCase()
  const ings = Array.isArray(ingredientList) ? ingredientList.map(i => i.item || '') : []
  const searchTerms = [name, ...ings.map(s => (s || '').toLowerCase())]
  
  // Try exact match first
  for (const term of searchTerms) {
    if (priceLookup[term]) {
      return {
        samsClubPrice: priceLookup[term].samsClubPrice,
        source: priceLookup[term].source,
        matchedOn: term
      }
    }
  }
  
  // Try keyword match
  for (const term of searchTerms) {
    const words = term.split(/[,\s]+/).filter(w => w.length > 3)
    for (const word of words) {
      if (priceLookup[word]) {
        return {
          samsClubPrice: priceLookup[word].samsClubPrice,
          source: priceLookup[word].source,
          matchedOn: word
        }
      }
    }
    
    // Try substring match
    for (const [key, val] of Object.entries(priceLookup)) {
      if (term.includes(key) || key.includes(term)) {
        return {
          samsClubPrice: val.samsClubPrice,
          source: val.source,
          matchedOn: key
        }
      }
    }
  }
  
  return null
}

// Estimate per-serving cost from per-lb price
function estimatePerServing(pricePerLb, servingSizeOz = 4) {
  const pricePerOz = pricePerLb / 16
  return pricePerOz * servingSizeOz
}

async function main() {
  console.log('=== Sam\'s Club Pricing Integration ===\n')
  
  // Fetch all menu items
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, category, section, ingredient_list, ingredient_links, cost_per_serving, suggested_menu_price')
  
  if (error) {
    console.error('Error fetching items:', error.message)
    process.exit(1)
  }
  
  console.log(`Loaded ${items.length} menu items from database\n`)
  
  // Build price lookup
  const priceLookup = buildPriceLookup(pricingResearch.ingredients)
  console.log(`Built price lookup with ${Object.keys(priceLookup).length} search terms\n`)
  
  let updatedCount = 0
  let matchedCount = 0
  let skippedCount = 0
  
  for (const item of items) {
    const ingredientList = typeof item.ingredient_list === 'string' 
      ? JSON.parse(item.ingredient_list) 
      : item.ingredient_list || []
    
    const ingredientLinks = typeof item.ingredient_links === 'string'
      ? JSON.parse(item.ingredient_links)
      : item.ingredient_links || {}
    
    // Skip items with no ingredient list
    if (!Array.isArray(ingredientList) || ingredientList.length === 0) {
      skippedCount++
      continue
    }
    
    // Update each ingredient with Sam's Club price
    let hasSamsPrice = false
    const updatedIngredientList = ingredientList.map(ing => {
      const match = findBestPrice(ing.item, ingredientList, priceLookup)
      if (match && match.samsClubPrice != null) {
        hasSamsPrice = true
        return { ...ing, samsClubPrice: match.samsClubPrice }
      }
      return ing
    })
    
    if (!hasSamsPrice) {
      // Try matching on item name directly
      const itemMatch = findBestPrice(item.name, ingredientList, priceLookup)
      if (itemMatch && itemMatch.samsClubPrice != null) {
        // Apply Sam's Club price to the first ingredient
        updatedIngredientList[0] = { ...updatedIngredientList[0], samsClubPrice: itemMatch.samsClubPrice }
        hasSamsPrice = true
      }
    }
    
    if (!hasSamsPrice) {
      skippedCount++
      continue
    }
    
    // Calculate Sam's Club cost per serving
    const samsPerServing = updatedIngredientList.reduce((sum, ing) => {
      if (ing.samsClubPrice != null) return sum + ing.samsClubPrice
      return sum
    }, 0)
    
    const RATIO = item.cost_per_serving && ingredientLinks.costco?.costPerServing
      ? item.cost_per_serving / ingredientLinks.costco.costPerServing
      : 1
    
    const totalFor150 = samsPerServing * 150
    const existingCostco = ingredientLinks.costco?.costPerServing
    
    // Update ingredient_links with Sam's Club data
    const updatedLinks = {
      ...ingredientLinks,
      sams: {
        costPerServing: samsPerServing,
        totalFor150: Math.round(totalFor150 * 100) / 100,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    
    // Recalculate savings if we have Costco data
    if (existingCostco && samsPerServing < existingCostco) {
      updatedLinks.savingsPerServing = existingCostco - samsPerServing
      updatedLinks.savingsPercent = Math.round(((existingCostco - samsPerServing) / existingCostco) * 100)
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('menu_items')
      .update({
        ingredient_list: JSON.stringify(updatedIngredientList),
        ingredient_links: JSON.stringify(updatedLinks),
      })
      .eq('id', item.id)
    
    if (updateError) {
      console.error(`  ❌ Error updating ${item.name}: ${updateError.message}`)
    } else {
      updatedCount++
      matchedCount++
      console.log(`  ✅ ${item.name} — Sam's: $${samsPerServing.toFixed(2)}/serving`)
    }
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Total items: ${items.length}`)
  console.log(`Updated with Sam's pricing: ${updatedCount}`)
  console.log(`Skipped (no ingredient data): ${skippedCount}`)
  console.log(`Mapped from ${Object.keys(priceLookup).length} price terms`)
}

main().catch(console.error)