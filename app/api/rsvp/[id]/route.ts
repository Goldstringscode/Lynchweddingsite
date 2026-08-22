import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { access_code } = body

  // Verify guest exists and access_code matches (public auth, no admin required)
  const { data: guest, error: lookupError } = await supabaseAdmin
    .from('guests')
    .select('id')
    .eq('id', params.id)
    .eq('access_code', access_code || '')
    .maybeSingle()

  if (lookupError || !guest) {
    return NextResponse.json({ error: 'Guest not found or access code invalid' }, { status: 404 })
  }

  // Only allow updating safe fields (not id, access_code, created_at, etc.)
  const allowed = ['name', 'email', 'phone', 'guest_count', 'meal_choice', 'guest_meal', 'dietary', 'is_attending']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      // Normalize email on edit too
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