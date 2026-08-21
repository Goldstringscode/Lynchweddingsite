import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const brandRegSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'

    // Check for any existing campaigns
    try {
      const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
      for (const c of existing) {
        if (c.campaignStatus === 'FAILED') {
          await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
          results.cleaned = c.sid
        }
      }
    } catch (e: any) {
      results.clean_error = e.message
    }

    // Create campaign with LOW_VOLUME use case and all required fields
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: brandRegSid,
          description: 'Wedding event communications. Sole proprietor sending RSVP confirmations and event reminders to wedding guests who provided their phone number and explicit consent via the RSVP form at houseoflynch.app. Opt-in only — no marketing.',
          usAppToPersonUsecase: 'LOW_VOLUME',
          hasEmbeddedLinks: false,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to unsubscribe.',
            'Reminder: Wedding tomorrow at 4 PM. Reply STOP to opt out.',
            'Wedding update: See houseoflynch.app for details. Reply STOP to unsubscribe.',
          ],
          messageFlow: '1. Guest visits houseoflynch.app and fills out RSVP form. 2. Guest provides their name, email, and phone number. 3. By submitting the form, guest explicitly consents to receive wedding-related text messages. 4. Couple sends RSVP confirmations and event reminders through the admin dashboard. 5. Guest can reply STOP at any time to opt out of future messages. All messages are sent manually by the couple — no automated campaigns.',
        })
      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      results.campaign_error_code = e.code
      results.campaign_more_info = e.moreInfo
    }

    // Assign phone
    try {
      await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
      results.phone_assigned = true
    } catch (e: any) {
      results.phone_error = e.message
    }

    // Test SMS
    if (results.campaign) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Wedding SMS active. Reply STOP to opt out.',
          to: '+14795307328',
          statusCallback: 'https://houseoflynch.app/api/sms/status',
        })
        results.test = { sid: sent.sid, status: sent.status, error: sent.errorCode }
      } catch (e: any) {
        results.test_error = e.message
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}