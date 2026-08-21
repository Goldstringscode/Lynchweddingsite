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

    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const brandRegSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'

    // Step 1: Check if old brand registration still exists
    try {
      const endpoints = await client.trusthub.v1.endUserTypes.list({ limit: 5 })
      results.endpoints_sample = endpoints.length
    } catch (e: any) {
      results.endpoint_error = e.message
    }

    // Step 2: Try creating campaign with the BN (brand registration) SID from setup script
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: brandRegSid,
          description: 'Wedding RSVP confirmations and event reminders for guests who opt in via website. Sole proprietor.',
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',
          hasEmbeddedLinks: true,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
            'Reminder: Nikkita & Justin wedding this Saturday at 4 PM. See houseoflynch.app. Reply STOP to opt out.',
          ],
          messageFlow: 'Guests opt in by providing phone number on RSVP form at houseoflynch.app. They receive a confirmation message after RSVP. A reminder is sent before the wedding. Guests can reply STOP to opt out at any time.',
        })
      results.campaign = {
        sid: campaign.sid,
        campaignStatus: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      results.campaign_error_code = e.code
      if (e.moreInfo) results.campaign_more_info = e.moreInfo
    }

    // Step 3: Check if phone is on messaging service
    try {
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone = {
        messagingServiceSid: phone.messagingServiceSid,
        sms: phone.capabilities.sms,
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}