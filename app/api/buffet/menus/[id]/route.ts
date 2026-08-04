import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { id } = await params
  try {
    const body = await request.json()
    // Whitelist editable fields — prevent mass-assignment of unintended columns
    const ALLOWED = ["name", "price", "description", "category", "serves", "is_active", "sort_order", "image_url"]
    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (key in body) updates[key] = body[key]
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }
    const { error } = await supabaseAdmin
      .from("buffet_menus")
      .update(updates)
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { id } = await params
  const { error } = await supabaseAdmin
    .from("buffet_menus")
    .update({ is_active: false })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}