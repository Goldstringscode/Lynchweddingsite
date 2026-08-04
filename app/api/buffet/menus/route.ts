import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data, error } = await supabaseAdmin
    .from("buffet_menus")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Menu name is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("buffet_menus")
      .insert({
        name,
        stations: [],
        guest_count: 80,
        total_cost_per_person: 0,
        total_menu_cost: 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}