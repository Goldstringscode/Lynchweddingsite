import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data: guests, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(guests)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, phone, guest_count, meal_choice, guest_meal, is_attending, dietary } = body
  const rawEmail = body.email || ''
  // Normalize: lowercase + trim prevents case-duplicate RSVPs
  const email = rawEmail.trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  // Check for existing guest — normalized to lowercase
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('email', email)
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: 'Something went wrong checking your RSVP. Please try again.' }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ error: 'A guest with this email has already RSVP\'d. Please contact the wedding planner to update your response.' }, { status: 409 })
  }

  const accessCode = 'WED-' + (name.trim().split(/\s+/).pop()?.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'GUEST') + '-' + Math.floor(100000 + Math.random() * 900000)

  const { data, error } = await supabaseAdmin
    .from('guests')
    .insert([{
      name,
      email,  // normalized lowercase
      phone: phone || null,
      guest_count: guest_count || 1,
      meal_choice: meal_choice || null,
      guest_meal: guest_meal || null,
      dietary: dietary || null,
      access_code: accessCode,
      is_attending: is_attending !== undefined ? is_attending : true,
    }])
    .select()
    .single()

  // Handle race-condition duplicate (unique constraint catches what the select missed)
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A guest with this email has already RSVP\'d. Please contact the wedding planner to update your response.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}