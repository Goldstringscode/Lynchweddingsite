import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data, error } = await supabaseAdmin
    .from("buffet_items")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const body = await request.json()
    const { category, name, description, section, price_per_person, cost_per_serving,
            station_type, dietary_labels, difficulty, prep_time, portion_weight_g,
            is_signature, is_available, suggested_menu_price, ingredient_links,
            ingredient_list, pricing_breakdown, nutrition, allergens, season_tags,
            guest_count_scale, sort_order } = body

    if (!category || !name) {
      return NextResponse.json({ error: "Missing required fields (category, name)" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("buffet_items")
      .insert({ 
        category, name,
        section: section || category,
        description: description || "",
        price_per_person: price_per_person || null,
        cost_per_serving: cost_per_serving || 0,
        station_type: station_type || "self-serve",
        dietary_labels: dietary_labels || [],
        difficulty: difficulty || "medium",
        prep_time: prep_time || 30,
        portion_weight_g: portion_weight_g || null,
        is_signature: is_signature ?? false,
        is_available: is_available ?? true,
        suggested_menu_price: suggested_menu_price || null,
        ingredient_links: ingredient_links || {},
        ingredient_list: ingredient_list || [],
        pricing_breakdown: pricing_breakdown || {},
        nutrition: nutrition || {},
        allergens: allergens || [],
        season_tags: season_tags || [],
        guest_count_scale: guest_count_scale || 10,
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid request body: " + (e.message || "") }, { status: 400 })
  }
}