import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    if (sid) {
      try {
        await supabaseAdmin
          .from('sms_messages')
          .update({
            status,
            error_code: errorCode || null,
            error_message: errorMsg || null,
            updated_at: new Date().toISOString(),
          })
          .eq('twilio_sid', sid)
      } catch (dbErr: any) {
        console.error('Status update failed:', dbErr.message)
      }
    }

    // Always acknowledge so Twilio stops retrying.
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: true })
  }
}

// GET /api/sms/status → recent messages + delivery statuses
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('sms_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ messages: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}