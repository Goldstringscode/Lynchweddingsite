import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data, error } = await supabaseAdmin
    .from("menu_items")
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
    const { category, name, description, price, sort_order, is_available } = body

    if (!category || !name) {
      return NextResponse.json({ error: "Missing required fields (category, name)" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .insert({ category, name, description: description || "", price: price || null, sort_order: sort_order || 0, is_available: is_available ?? true })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const body = await request.json()
    const { id, category, name, description, price, sort_order, is_available } = body

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (category !== undefined) updates.category = category
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = price
    if (sort_order !== undefined) updates.sort_order = sort_order
    if (is_available !== undefined) updates.is_available = is_available

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id query param" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from("menu_items").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}