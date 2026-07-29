import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: guests, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(guests)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, guest_count, meal_choice } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const accessCode = 'RSVP-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabaseAdmin
    .from('guests')
    .insert([{ name, email, phone: phone || null, guest_count: guest_count || 1, meal_choice: meal_choice || null, access_code: accessCode, is_attending: true }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}