import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("wedding_checklist")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_completed, notes } = body

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const updates: Record<string, any> = {}
    if (typeof is_completed === "boolean") {
      updates.is_completed = is_completed
      updates.completed_at = is_completed ? new Date().toISOString() : null
    }
    if (typeof notes === "string") {
      updates.notes = notes
    }

    const { data, error } = await supabaseAdmin
      .from("wedding_checklist")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}