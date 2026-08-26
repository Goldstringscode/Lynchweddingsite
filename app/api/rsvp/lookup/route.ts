import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── Public ticket recovery ──────────────────────────────────────────
// Look up an EXISTING RSVP by name + email so a guest who lost their
// ticket can re-download it. Requires BOTH to match (email is the unique
// key; name adds a second factor) so a stranger can't pull someone's
// ticket by guessing a name alone. Returns only the fields the ticket
// needs — never the whole row.
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const rawName = typeof body.name === 'string' ? body.name.trim() : ''
  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!rawName || rawName.length > 120 || !rawEmail || rawEmail.length > 254) {
    return NextResponse.json(
      { error: 'Please enter the name and email you used to RSVP.' },
      { status: 400 },
    )
  }

  try {
    // Email is stored normalized lowercase + unique index on lower(email).
    const { data: guest, error } = await supabaseAdmin
      .from('guests')
      .select('id, name, email, phone, guest_count, meal_choice, guest_meal, dietary, is_attending, access_code')
      .eq('email', rawEmail)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Ticket lookup error:', error.message)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Verify name too (case-insensitive, trimmed) — second factor.
    const nameMatches =
      guest && guest.name.trim().toLowerCase() === rawName.toLowerCase()

    if (!guest || !nameMatches) {
      return NextResponse.json(
        {
          error:
            "We couldn't find an RSVP with that name and email. Double-check the spelling, or reach out to Nikkita & Justin and we'll get you your ticket.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone ?? '',
      guest_count: guest.guest_count ?? 1,
      meal_choice: guest.meal_choice ?? null,
      guest_meal: guest.guest_meal ?? null,
      dietary: guest.dietary ?? '',
      is_attending: guest.is_attending,
      access_code: guest.access_code ?? '',
    })
  } catch (err: any) {
    console.error('Ticket lookup route error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
