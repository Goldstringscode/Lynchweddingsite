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
    const sid = process.env.TWILIO_ACCOUNT_SID!
    const token = process.env.TWILIO_AUTH_TOKEN!
    const client = twilio(sid, token)
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const customerProfileSid = 'BU670ae9c0fdad9af327ac59eabd0e4ffe' // "Jstrings" — twilio-approved

    // Check ALL campaigns for details on why they failed
    try {
      const campaigns = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .list()
      results.campaigns = campaigns.map((c: any) => ({
        sid: c.sid,
        status: c.campaignStatus,
        brandSid: c.brandRegistrationSid,
      }))
    } catch (e: any) {
      results.campaigns_error = e.message
    }

    // Step 1: Delete failed campaign
    const failedSid = 'QE2c6890da8086d771620e9b13fadeba0b'
    try {
      await client.messaging.v1.services(msgSid).usAppToPerson(failedSid).remove()
      results.deleted = failedSid
    } catch (e: any) {
      results.delete_error = e.message
    }

    // Step 2: Create NEW campaign with Customer Profile as brand (for SOLE_PROPRIETOR low-volume)
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: customerProfileSid,
          description: 'Wedding RSVP confirmations and event reminders for guests who opt in via the RSVP form at houseoflynch.app. Sole proprietor. NOT marketing — opt-in only.',
          usAppToPersonUsecase: 'LOW_VOLUME',
          hasEmbeddedLinks: true,
          hasEmbeddedPhone: false,
          messageSamples: [
            'You are confirmed for the wedding! Reply STOP to unsubscribe.',
            'Wedding reminder: See you tomorrow at 4pm! Reply STOP to opt out.',
          ],
          messageFlow: 'Guests opt in by providing their phone number on the RSVP form at houseoflynch.app. They receive an RSVP confirmation message. A wedding-day reminder is sent. Guests can text STOP to opt out at any time. Messages are triggered manually by the couple through the admin dashboard.',
        })
      results.campaign = { sid: campaign.sid, status: campaign.campaignStatus }
    } catch (e: any) {
      results.campaign_error = e.message
      results.campaign_error_code = e.code
      if (e.moreInfo) results.campaign_more_info = e.moreInfo
      if (e.details) results.campaign_details = e.details
    }

    // Step 3: Assign phone to messaging service
    try {
      await client.incomingPhoneNumbers(phoneSid)
        .update({ messagingServiceSid: msgSid })
      results.phone_assigned = true
    } catch (e: any) {
      results.phone_error = e.message
    }

    // Step 4: Send test SMS if campaign created
    if (results.campaign) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Wedding SMS test — pipeline active. Reply STOP to opt out.',
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