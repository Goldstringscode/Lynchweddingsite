import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Creates campaign if none exists. Does NOT delete existing campaigns.
export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    
    const brandSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'
    const msgSid  = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'

    // Check existing campaigns — DO NOT DELETE
    const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
    results.existing = existing.map((c: any) => ({ sid: c.sid, status: c.campaignStatus }))

    if (existing.length > 0) {
      results.action = 'campaign_exists'
      results.campaign = { sid: existing[0].sid, status: existing[0].campaignStatus }
    } else {
      results.action = 'creating_campaign'
      try {
        const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
          brandRegistrationSid: brandSid,
          description: 'Wedding RSVP confirmations and event reminders for guests who opted in via the RSVP form at houseoflynch.app. Sole proprietor couple. Not marketing — purely operational opt-in wedding communications. Guests can reply STOP to opt out at any time.',
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',
          hasEmbeddedLinks: false,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out of future messages.',
            'Wedding reminder: Nikkita & Justin this Saturday at 4 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
          ],
          messageFlow: 'Guest provides phone number on RSVP form at houseoflynch.app and explicitly consents to receive wedding text messages. Couple manually sends messages through admin dashboard. Guest can reply STOP at any time to unsubscribe.',
        })
        results.campaign = { sid: campaign.sid, status: campaign.campaignStatus }
      } catch (e: any) {
        results.campaign_error = e.message
        results.campaign_error_code = e.code
      }
    }

    // Assign phone to service
    try {
      await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone = {
        number: phone.phoneNumber,
        onService: phone.messagingServiceSid === msgSid,
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    // If campaign exists (created or pre-existing), send test SMS
    if (results.campaign && !results.campaign_error) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Wedding SMS verified. Reply STOP to opt out.',
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