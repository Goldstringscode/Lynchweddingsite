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
    const trustSid = 'BU401a2703ec03dc76d7e30da1e1126156' // "Lynch Wedding" — twilio-approved

    // Step 1: Delete the FAILED campaign so we can create a fresh one
    try {
      const failedCampaign = 'QE2c6890da8086d771620e9b13fadeba0b'
      await client.messaging.v1.services(msgSid)
        .usAppToPerson(failedCampaign)
        .remove()
      results.deleted_failed = true
    } catch (e: any) {
      results.delete_error = e.message
    }

    // Step 2: Create a new A2P campaign with the approved Trust Product
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: trustSid,
          description: 'Wedding RSVP confirmations and event reminders for guests who opt in via houseoflynch.app. Not marketing. Sole proprietor.',
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',
          hasEmbeddedLinks: true,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
            'Reminder: Nikkita & Justin wedding this Saturday at 4 PM. See houseoflynch.app for details. Reply STOP to opt out.',
          ],
          messageFlow: 'Guests opt in by providing their phone number on the RSVP form at houseoflynch.app. They receive an RSVP confirmation message. A week-of reminder is sent before the wedding. Guests can reply STOP to opt out at any time.',
        })
      results.campaign = {
        sid: campaign.sid,
        campaignStatus: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      results.campaign_error_code = e.code
      if (e.details) results.campaign_details = JSON.stringify(e.details)
    }

    // Step 3: Re-assign phone to messaging service
    try {
      const phone = await client.incomingPhoneNumbers(phoneSid)
        .update({ messagingServiceSid: msgSid })
      results.phone_assigned = {
        number: phone.phoneNumber,
        service: phone.messagingServiceSid,
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}