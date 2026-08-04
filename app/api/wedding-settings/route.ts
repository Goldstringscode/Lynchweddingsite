import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data, error } = await supabaseAdmin
    .from("wedding_settings")
    .select("*")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || {})
}

export async function PUT(request: NextRequest) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const body = await request.json()
    const { email_notifications, wedding_date } = body

    // Upsert: only one row with a fixed id
    const { data, error } = await supabaseAdmin
      .from("wedding_settings")
      .upsert({ id: 1, email_notifications, wedding_date, updated_at: new Date().toISOString() })
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