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

    const messagingService = process.env.TWILIO_MESSAGING_SERVICE_SID
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    // Step 1: Check if a campaign already exists for this messaging service
    try {
      const existing = await client.messaging.v1.usAppToPerson.list({ limit: 10 })
      results.existing_campaigns = existing.map((c: any) => ({
        sid: c.sid,
        status: c.campaignStatus,
        messagingServiceSid: c.messagingServiceSid,
      }))
    } catch (e: any) {
      results.existing_check = 'No campaigns found or API error: ' + e.message
    }

    // Step 2: Use approved Trust Product "Lynch Wedding"
    const trustProductSid = 'BU401a2703ec03dc76d7e30da1e1126156' // TWILIO-APPROVED

    // Step 3: Create Secondary Customer Profile (SCP)
    // The US A2P flow requires: Trust Product → Secondary Customer Profile → Campaign
    try {
      // Create Secondary Customer Profile
      const scp = await client.trusthub.v1.customerProfiles.create({
        email: 'jstringscode@gmail.com',
        friendlyName: 'Lynch Wedding Campaign Profile',
        policySid: 'RNdfbf3fae0e1107f8ded2d079c00ee187', // A2P standard policy
        statusCallback: 'https://houseoflynch.app/api/sms/status',
      })
      results.customer_profile = { sid: scp.sid, status: scp.status }
    } catch (e: any) {
      results.customer_profile_error = e.message
    }

    // Step 4: Create A2P campaign using the Messaging Service SID
    try {
      const campaign = await client.messaging.v1.usAppToPerson.create({
        brandRegistrationSid: trustProductSid,
        description: 'Wedding RSVP confirmations, event reminders, and thank-you messages sent to wedding guests who explicitly opted in via the RSVP form on houseoflynch.app. Guests can text STOP to opt out at any time.',
        hasEmbeddedLinks: true,
        hasEmbeddedPhone: false,
        messageSamples: [
          "Thank you for your RSVP! We're excited to celebrate with you. Reply STOP to opt out.",
        ],
        messageFlow: 'Guest opts in by providing phone number on the RSVP form at houseoflynch.app. After RSVP, they receive a confirmation message. Week-of reminders are sent. Guests can reply STOP to opt out anytime.',
        usAppToPersonUsecase: 'SOLE_PROPRIETOR',
      })
      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      if (e.code) results.campaign_error_code = e.code
    }

    // Step 5: If campaign exists, assign phone to messaging service
    if (messagingService && phoneNumber) {
      try {
        const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
        await client.incomingPhoneNumbers(phoneSid).update({
          messagingServiceSid: messagingService,
        })
        results.phone_assigned = true
      } catch (e: any) {
        results.phone_assignment_error = e.message
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}