import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeFields, vendorCreateSchema } from '@/lib/sanitize'
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const { data, error } = await supabaseAdmin
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const body = await request.json()

  // Whitelist + type-check: only allow fields defined in vendorCreateSchema
  const { data: allowedFields, error: validationError } = sanitizeFields(body, vendorCreateSchema)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  if (!allowedFields) {
    return NextResponse.json({ error: 'Unexpected error processing request body' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('vendors')
    .insert([allowedFields])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}