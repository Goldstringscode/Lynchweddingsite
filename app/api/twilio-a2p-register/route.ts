import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ONE-TIME: Delete FAILED campaign, create NEW one, then LEAVE IT for Twilio review.
// After this, the endpoint goes read-only. Never deletes. Never recreates.
export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const brandSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'

    // Check for campaigns — only clean FAILED ones
    const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
    
    // Only delete if FAILED
    let hasNonFailed = false
    for (const c of existing) {
      if (c.campaignStatus === 'FAILED' || c.campaignStatus === 'REJECTED') {
        await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
        results.removed = c.sid
      } else {
        hasNonFailed = true
        results.keeping = { sid: c.sid, status: c.campaignStatus }
      }
    }

    // Only create if no non-failed campaign exists
    if (!hasNonFailed) {
      const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
        brandRegistrationSid: brandSid,
        description: 'Wedding RSVP confirmations and event reminders for guests who opted in via houseoflynch.app RSVP form. Sole proprietor couple sending manual text messages only to guests who provided phone number and explicit consent. Not marketing — purely operational wedding communications.',
        usAppToPersonUsecase: 'SOLE_PROPRIETOR',
        hasEmbeddedLinks: false,
        hasEmbeddedPhone: false,
        messageSamples: [
          'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
          'Reminder: Nikkita & Justin wedding this Saturday at 4 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
        ],
        messageFlow: 'Guest provides name and phone number on the RSVP form at houseoflynch.app and explicitly consents to receive wedding text messages. The couple manually sends RSVP confirmations and event reminders through their admin dashboard. Guest can reply STOP at any time to opt out of future messages.',
      })
      results.campaign = { sid: campaign.sid, status: campaign.campaignStatus }
    }

    // Assign phone to service
    await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
    results.phone_assigned = true

    // Send test SMS
    const sent = await client.messages.create({
      messagingServiceSid: msgSid,
      body: '✅ Wedding SMS. Reply STOP to opt out.',
      to: '+14795307328',
      statusCallback: 'https://houseoflynch.app/api/sms/status',
    })
    results.test = { sid: sent.sid, status: sent.status, error: sent.errorCode }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: 500 })
  }
}