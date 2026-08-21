import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// READ-ONLY: Only creates campaign if NONE exist. Never deletes. Never recreates.
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

    // Check existing campaigns — NEVER DELETE
    const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
    results.existing = existing.map((c: any) => ({ sid: c.sid, status: c.campaignStatus }))

    if (existing.length > 0) {
      results.action = 'waiting_for_review'
      results.campaign = { sid: existing[0].sid, status: existing[0].campaignStatus }
    } else {
      results.action = 'creating'
      try {
        const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
          brandRegistrationSid: brandSid,
          description: 'Wedding RSVP confirmations and event reminders for guests who opted in via houseoflynch.app RSVP form. Sole proprietor. Not marketing.',
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',
          hasEmbeddedLinks: false,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
            'Reminder: Nikkita & Justin wedding this Saturday at 4 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
          ],
          messageFlow: 'Guest provides phone number on RSVP form at houseoflynch.app and consents to text messages. Couple manually sends confirmations and reminders. Guest can reply STOP to opt out.',
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
      results.phone = { number: phone.phoneNumber, onService: phone.messagingServiceSid === msgSid }
    } catch (e: any) {
      results.phone_error = e.message
    }

    // Send test if campaign exists
    if (existing.length > 0 && existing[0].campaignStatus !== 'FAILED') {
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