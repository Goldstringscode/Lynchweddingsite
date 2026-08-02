import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("menu_drafts")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, event_type, guest_count, target_budget_per_person, courses } = body

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("menu_drafts")
      .insert({
        name,
        description: description || "",
        event_type: event_type || "wedding",
        guest_count: guest_count || 80,
        target_budget_per_person: target_budget_per_person || null,
        courses: courses || [],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, guest_count, target_budget_per_person, courses, is_locked } = body

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (guest_count !== undefined) updates.guest_count = guest_count
    if (target_budget_per_person !== undefined) updates.target_budget_per_person = target_budget_per_person
    if (courses !== undefined) updates.courses = courses
    if (is_locked !== undefined) updates.is_locked = is_locked

    const { data, error } = await supabaseAdmin
      .from("menu_drafts")
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
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const { error } = await supabaseAdmin.from("menu_drafts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}