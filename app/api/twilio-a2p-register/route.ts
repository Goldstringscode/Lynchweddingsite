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
    const brandSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'

    // Step 1: Clean failed campaigns
    const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
    results.cleaned = []
    for (const c of existing) {
      await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
      results.cleaned.push(c.sid)
    }

    // Step 2: Assign phone to service with retry
    for (let i = 0; i < 3; i++) {
      await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      if (phone.messagingServiceSid === msgSid) {
        results.phone_assigned = true
        break
      }
    }

    // Step 3: Create SOLE_PROPRIETOR campaign
    const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
      brandRegistrationSid: brandSid,
      description: 'Wedding RSVP confirmations and event reminders for guests who opted in via houseoflynch.app RSVP form. Sole proprietor. Not marketing — opt-in only operational messages. Reply STOP to unsubscribe.',
      usAppToPersonUsecase: 'SOLE_PROPRIETOR',
      hasEmbeddedLinks: false,
      hasEmbeddedPhone: false,
      messageSamples: [
        'Thank you for your RSVP, {Name}! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
        'Wedding reminder: Nikkita & Justin this Saturday at 4 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
      ],
      messageFlow: 'Guest provides phone number and explicitly consents to wedding text messages on the RSVP form at houseoflynch.app. Couple manually sends confirmation and reminder messages through the admin dashboard. Guest can reply STOP to opt out at any time.',
    })

    results.campaign = { sid: campaign.sid, status: campaign.campaignStatus }

    // Step 4: Send test
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