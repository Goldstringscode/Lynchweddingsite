import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { searchParams } = new URL(request.url)
  const draftIds = searchParams.get("ids") // comma-separated UUIDs
  const inflationYear = parseInt(searchParams.get("inflationYear") || "0")
  const inflationMonth = parseInt(searchParams.get("inflationMonth") || "0")

  if (!draftIds) {
    return NextResponse.json({ error: "Provide comma-separated ?ids=uuid1,uuid2" }, { status: 400 })
  }

  const ids = draftIds.split(",").filter(Boolean)
  if (ids.length < 2 || ids.length > 5) {
    return NextResponse.json({ error: "Compare 2–5 drafts" }, { status: 400 })
  }

  const { data: drafts, error } = await supabaseAdmin
    .from("menu_drafts")
    .select("*")
    .in("id", ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!drafts || drafts.length < 2) {
    return NextResponse.json({ error: "Not enough drafts found" }, { status: 404 })
  }

  // Fetch all menu items referenced across all drafts
  const itemIds = new Set<string>()
  for (const d of drafts) {
    for (const c of d.courses || []) {
      if (c.item_id) itemIds.add(c.item_id)
    }
  }
  const { data: items, error: itemErr } = await supabaseAdmin
    .from("menu_items")
    .select("*")
    .in("id", [...itemIds])

  const itemMap = new Map((items || []).map((i: any) => [i.id, i]))

  // Compute comparison data per draft
  const compareData = drafts.map((draft: any) => {
    const courses = draft.courses || []
    let totalCost = 0
    let totalWeight = 0
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0
    let totalFiber = 0
    let itemCount = 0

    const courseDetails = courses.map((c: any) => {
      const item = itemMap.get(c.item_id)
      if (!item) return null
      const portionMultiplier =
        c.portion_size === "small" ? 0.7
        : c.portion_size === "large" ? 1.35
        : 1.0
      const price = (item.suggested_menu_price || item.price || 0) * portionMultiplier
      const weight = (item.portion_weight_g || 0) * portionMultiplier
      const nutrition = item.nutrition || {}

      totalCost += price
      totalWeight += weight
      totalCalories += (nutrition.calories || 0) * portionMultiplier
      totalProtein += (nutrition.protein || 0) * portionMultiplier
      totalCarbs += (nutrition.carbs || 0) * portionMultiplier
      totalFat += (nutrition.fat || 0) * portionMultiplier
      totalFiber += (nutrition.fiber || 0) * portionMultiplier
      itemCount++

      return {
        course_number: c.course_number,
        course_type: c.course_type,
        portion_size: c.portion_size,
        item_name: item.name,
        price,
        weight_g: Math.round(weight),
        weight_oz: (weight / 28.3495).toFixed(1),
        calories: Math.round(nutrition.calories || 0 * portionMultiplier),
        protein_g: Math.round((nutrition.protein || 0) * portionMultiplier),
        carbs_g: Math.round((nutrition.carbs || 0) * portionMultiplier),
        fat_g: Math.round((nutrition.fat || 0) * portionMultiplier),
      }
    }).filter(Boolean)

    const ppCost = totalCost
    const totalCostAll = totalCost * (draft.guest_count || 150)

    return {
      id: draft.id,
      name: draft.name,
      guest_count: draft.guest_count,
      item_count: itemCount,
      per_person_cost: Math.round(ppCost * 100) / 100,
      total_cost: Math.round(totalCostAll * 100) / 100,
      total_weight_g: Math.round(totalWeight),
      total_weight_oz: (totalWeight / 28.3495).toFixed(1),
      avg_weight_per_item_g: itemCount ? Math.round(totalWeight / itemCount) : 0,
      total_calories: Math.round(totalCalories),
      total_protein_g: Math.round(totalProtein),
      total_carbs_g: Math.round(totalCarbs),
      total_fat_g: Math.round(totalFat),
      total_fiber_g: Math.round(totalFiber),
      courses: courseDetails,
    }
  })

  // Apply inflation multiplier if requested
  let inflationMultiplier = 1
  if (inflationYear) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/inflation?year=${inflationYear}&month=${inflationMonth || 6}`
      )
      const inf = await res.json()
      inflationMultiplier = inf.target_multiplier || 1
    } catch {}
  }

  if (inflationMultiplier !== 1) {
    for (const d of compareData) {
      d.per_person_cost = Math.round(d.per_person_cost * inflationMultiplier * 100) / 100
      d.total_cost = Math.round(d.total_cost * inflationMultiplier * 100) / 100
      for (const c of d.courses as any[]) {
        c.price = Math.round(c.price * inflationMultiplier * 100) / 100
      }
    }
  }

  return NextResponse.json({
    drafts: compareData,
    inflation_multiplier: inflationMultiplier,
    inflation_year: inflationYear || null,
  })
}