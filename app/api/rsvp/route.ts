import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'


// ── Input validation ───────────────────────────────────────────────
function validate(fields: Record<string, unknown>): string | null {
  if (typeof fields.name !== 'string' || !fields.name.trim() || fields.name.length > 120) {
    return 'Please provide your full name.'
  }
  if (typeof fields.email !== 'string' || !fields.email.trim() || fields.email.length > 254) {
    return 'Please provide a valid email address.'
  }
  const gc = Number(fields.guest_count)
  if (gc !== undefined && (!Number.isInteger(gc) || gc < 1 || gc > 12)) {
    return 'Party size must be between 1 and 12.'
  }
  if (fields.phone !== undefined && fields.phone !== null && 
      typeof fields.phone === 'string' && fields.phone.length > 30) {
    return 'Phone number is too long.'
  }
  if (fields.dietary !== undefined && fields.dietary !== null &&
      typeof fields.dietary === 'string' && fields.dietary.length > 500) {
    return 'Dietary notes are too long.'
  }
  return null
}

// ── Admin GET ───────────────────────────────────────────────────────
export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  try {
    const { data: guests, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('RSVP list error:', error.message)
      return NextResponse.json({ error: 'Failed to load guests' }, { status: 500 })
    }
    return NextResponse.json(guests)
  } catch (err: any) {
    console.error('RSVP route error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Public POST ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  // Parse body safely
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Validate
  const validationError = validate(body)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const { name, phone, guest_count, meal_choice, guest_meal, is_attending, dietary } = body as Record<string, any>
  const rawEmail = (body.email as string) || ''
  const email = rawEmail.trim().toLowerCase()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  // Check for existing guest — normalized to lowercase
  try {
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('guests')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (lookupError) {
      console.error('RSVP lookup error:', lookupError.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'A guest with this email has already RSVP\'d.' }, { status: 409 })
    }

    const accessCode = 'WED-' +
      (name.trim().split(/\s+/).pop()?.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'GUEST') +
      '-' + Math.floor(100000 + Math.random() * 900000)

    const { data, error } = await supabaseAdmin
      .from('guests')
      .insert([{
        name: name.trim(),
        email,
        phone: phone || null,
        guest_count: Math.min(Math.max(Number(guest_count) || 1, 1), 12),
        meal_choice: meal_choice || null,
        guest_meal: guest_meal || null,
        dietary: dietary || null,
        access_code: accessCode,
        is_attending: is_attending !== undefined ? is_attending : true,
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A guest with this email has already RSVP\'d.' }, { status: 409 })
      }
      console.error('RSVP insert error:', error.message)
      return NextResponse.json({ error: 'Could not save your RSVP. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('RSVP POST error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}