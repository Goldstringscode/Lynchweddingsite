import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
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
  try {
    const body = await request.json()
    const { category, name, description, price_per_person, sort_order, is_available } = body

    if (!category || !name) {
      return NextResponse.json({ error: "Missing required fields (category, name)" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("buffet_items")
      .insert({ 
        category, name, 
        description: description || "", 
        price_per_person: price_per_person || null, 
        sort_order: sort_order || 0, 
        is_available: is_available ?? true 
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}