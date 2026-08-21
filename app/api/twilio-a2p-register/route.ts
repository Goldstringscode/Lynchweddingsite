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

    // Step 1: Delete the FAILED campaign
    const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
    for (const c of existing) {
      await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
      results.removed = c.sid
    }

    // Step 2: Assign phone to messaging service
    await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
    results.phone_assigned = true

    // Step 3: Create campaign with STARTER template (matches what the console showed)
    // Console showed: "Starter" use case, BN49efd brand approved
    const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
      brandRegistrationSid: 'BN49efd1b2f418dccb5e7cc63cf941e8cf',
      description: 'Wedding RSVP confirmations and event reminders for guests who opted in via houseoflynch.app. Sole proprietor. Opt-in only. Reply STOP to unsubscribe.',
      usAppToPersonUsecase: 'STARTER',
      hasEmbeddedLinks: false,
      hasEmbeddedPhone: false,
      messageSamples: [
        'Thank you for your RSVP! See houseoflynch.app for details. Reply STOP to opt out.',
        'Wedding reminder: Tomorrow 4PM. Four Seasons Terra Lago. Reply STOP to opt out.',
      ],
      messageFlow: 'Guest provides phone on RSVP form at houseoflynch.app and consents to text messages. Couple manually sends confirmations and reminders. Guest can reply STOP to opt out.',
    })

    results.campaign = {
      sid: campaign.sid,
      status: campaign.campaignStatus,
      useCase: 'STARTER',
    }

    // Step 4: If campaign created, send test SMS
    if (results.campaign) {
      const sent = await client.messages.create({
        messagingServiceSid: msgSid,
        body: '✅ Wedding SMS. Reply STOP to opt out.',
        to: '+14795307328',
        statusCallback: 'https://houseoflynch.app/api/sms/status',
      })
      results.test = { sid: sent.sid, status: sent.status, error: sent.errorCode }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, code: e.code }, { status: 500 })
  }
}