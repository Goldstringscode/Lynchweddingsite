import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

// Admin-only: delete a guest
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const { error } = await supabaseAdmin
    .from('guests')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Public: edit own RSVP with access_code verification
// Admin: edit check_in field
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()

  // Gate by WHICH field is present, not by key count.
  // check_in is admin-only regardless of what else is in the body.
  if ('check_in' in body) {
    const authError = await authenticateAdmin()
    if (authError) return authError
    const { data, error } = await supabaseAdmin
      .from('guests')
      .update({ check_in: body.check_in })
      .eq('id', params.id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Public RSVP edit — requires access_code match
  const { access_code } = body

  const { data: guest, error: lookupError } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('id', params.id)
    .eq('access_code', access_code || '')
    .maybeSingle()

  if (lookupError || !guest) {
    return NextResponse.json({ error: 'Guest not found or access code invalid' }, { status: 404 })
  }

  // Whitelist: only these fields can be updated by the guest
  const allowed = ['name', 'email', 'phone', 'guest_count', 'meal_choice', 'guest_meal', 'dietary', 'is_attending']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = key === 'email' ? String(body[key]).trim().toLowerCase() : body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update(updates)
    .eq('id', params.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}