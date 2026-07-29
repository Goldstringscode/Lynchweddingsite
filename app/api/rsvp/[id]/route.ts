import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeFields, rsvpPatchSchema } from '@/lib/sanitize'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()

  // Whitelist + type-check: only allow fields defined in rsvpPatchSchema
  const { data: allowedFields, error: validationError } = sanitizeFields(body, rsvpPatchSchema)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  if (!allowedFields) {
    return NextResponse.json({ error: 'Unexpected error processing request body' }, { status: 400 })
  }

  // Nothing to update (empty body or no valid fields)
  if (Object.keys(allowedFields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update(allowedFields)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}