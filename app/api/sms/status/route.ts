import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST — Twilio status callback webhook (form-encoded, Twilio-signed)
export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const sid = form.get('MessageSid') as string | null
    const status = form.get('MessageStatus') as string | null
    const errorCode = form.get('ErrorCode') as string | null
    const errorMsg = form.get('ErrorMessage') as string | null

    if (!sid || !status) {
      return NextResponse.json({ error: 'Missing SID or status' }, { status: 400 })
    }

    // Validate Twilio signature using the official SDK
    const twilio = require('twilio')
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (authToken && !twilio.validateRequest(authToken, request.headers.get('x-twilio-signature') || '', request.url, Object.fromEntries(form))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only advance status — never regress (Twilio sends out-of-order callbacks)
    const orderedStatuses = ['queued', 'accepted', 'sent', 'delivered', 'read', 'failed', 'undelivered']
    const { data: existing } = await supabaseAdmin
      .from('sms_messages')
      .select('status')
      .eq('twilio_sid', sid)
      .maybeSingle()

    if (existing) {
      const currentIdx = orderedStatuses.indexOf(existing.status)
      const newIdx = orderedStatuses.indexOf(status)
      if (newIdx <= currentIdx && status !== 'failed' && status !== 'undelivered') {
        return NextResponse.json({ ok: true, skipped: true })
      }
    }

    await supabaseAdmin
      .from('sms_messages')
      .update({
        status,
        error_code: errorCode || null,
        error_message: errorMsg || null,
        updated_at: new Date().toISOString(),
      })
      .eq('twilio_sid', sid)

    return NextResponse.json({ ok: true })
  } catch {
    // Always acknowledge so Twilio stops retrying
    return NextResponse.json({ ok: true })
  }
}

// GET /api/sms/status → recent messages + delivery statuses (admin-only)
export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const { data, error } = await supabaseAdmin
      .from('sms_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      console.error('SMS status fetch error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
    return NextResponse.json({ messages: data || [] })
  } catch (err: any) {
    console.error('SMS status route error:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}