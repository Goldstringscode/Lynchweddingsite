// Twilio SMS send route — sends via Messaging Service (A2P 10DLC compliant)
// Env vars required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID (or TWILIO_PHONE_NUMBER fallback)
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  const authError = await authenticateAdmin()
  if (authError) return authError
  try {
    const { to, message, guestId, guestIds, template } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    // A2P-compliant: send via the Messaging Service (MG...) so the campaign rules apply.
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
    // Status callback webhook so delivery status is tracked in the sms_messages table.
    const statusCallback =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://houseoflynch.app'

    if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
    }

    // ---- Track which guest each phone corresponds to ----
    // Accept either a single guestId, or a per-phone array aligned with `to`.
    const numbers = Array.isArray(to) ? to : [to]
    const guestList: (string | null)[] = Array.isArray(guestIds)
      ? guestIds
      : numbers.map(() => guestId || null)

    const twilio = require('twilio')
    const client = twilio(accountSid, authToken)

    const results = []

    for (let i = 0; i < numbers.length; i++) {
      const phone = numbers[i]
      const gid = guestList[i] || null
      try {
        const messageParams: any = {
          body: message,
          to: phone,
          // Twilio POSTs status updates (sent/delivered/failed) back to this route.
          statusCallback: `${statusCallback}/api/sms/status`,
        }
        // Prefer the Messaging Service SID so sends use the registered A2P campaign.
        if (messagingServiceSid) messageParams.messagingServiceSid = messagingServiceSid
        else messageParams.from = fromNumber

        const sent = await client.messages.create(messageParams)
        results.push({ phone, status: 'sent', sid: sent.sid, guestId: gid })

        // Record the message for delivery-status tracking.
        try {
          await supabaseAdmin.from('sms_messages').insert({
            twilio_sid: sent.sid,
            to_phone: phone,
            from_number: messagingServiceSid || fromNumber || null,
            body: message,
            status: sent.status || 'queued',
            guest_id: gid,
            template: template || null,
          })
        } catch (dbErr: any) {
          console.error('Failed to log sms_messages row:', dbErr.message)
        }

        // If this is the "RSVP Thank You" template, mark the guest as thanked.
        if (gid && template && /thank/i.test(template)) {
          try {
            await supabaseAdmin
              .from('guests')
              .update({ thank_you_sent: true, thank_you_sent_at: new Date().toISOString() })
              .eq('id', gid)
          } catch (tyErr: any) {
            console.error('Failed to mark thank_you_sent:', tyErr.message)
          }
        }
      } catch (err: any) {
        results.push({ phone, status: 'failed', error: err.message, guestId: gid })
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}