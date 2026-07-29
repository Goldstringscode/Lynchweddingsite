import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sanitizeFields, invoiceCreateSchema } from '@/lib/sanitize'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Whitelist + type-check: only allow fields defined in invoiceCreateSchema
  const { data: allowedFields, error: validationError } = sanitizeFields(body, invoiceCreateSchema)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }
  if (!allowedFields) {
    return NextResponse.json({ error: 'Unexpected error processing request body' }, { status: 400 })
  }

  // Transform due_date from string to ISO timestamp
  const insertData = {
    ...allowedFields,
    due_date: new Date(allowedFields.due_date as string).toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert([insertData])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}