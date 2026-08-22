import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Twilio signature validation for webhook authenticity
function validateTwilioSignature(request: Request, formData: URLSearchParams): boolean {
  try {
    const twilioSignature = request.headers.get('x-twilio-signature')
    if (!twilioSignature) return false

    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (!authToken) return false

    // Build the full URL that Twilio called
    const url = new URL(request.url)
    // Sort params alphabetically for signature comparison
    const params: Record<string, string> = {}
    formData.forEach((value, key) => { params[key] = value })
    const sortedParams = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')

    // HMAC-SHA1 the url + sorted params with auth token
    const crypto = require('crypto')
    const data = url.toString() + sortedParams
    const hmac = crypto.createHmac('sha1', authToken)
    hmac.update(data)
    const computed = Buffer.from(hmac.digest('base64'))

    // Constant-time comparison
    const actual = Buffer.from(twilioSignature)
    if (computed.length !== actual.length) return false
    return crypto.timingSafeEqual(computed, actual)
  } catch {
    return false
  }
}

// POST — Twilio status callback webhook (form-encoded)
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

    // Validate Twilio signature
    const params = new URLSearchParams()
    form.forEach((value, key) => params.append(key, value.toString()))
    if (!validateTwilioSignature(request, params)) {
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
      // Only update if new status is further along (or final state)
      if (newIdx <= currentIdx && status !== 'failed' && status !== 'undelivered') {
        return NextResponse.json({ ok: true, skipped: true })
      }
    }

    if (sid) {
      await supabaseAdmin
        .from('sms_messages')
        .update({
          status,
          error_code: errorCode || null,
          error_message: errorMsg || null,
          updated_at: new Date().toISOString(),
        })
        .eq('twilio_sid', sid)
    }

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