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

    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const messagingSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const trustProductSid = 'BU401a2703ec03dc76d7e30da1e1126156'

    // Step 1: Register the approved Trust Product as a Brand
    try {
      const brand = await client.trusthub.v1.trustProducts(trustProductSid)
        .update({ status: 'complete' })
      results.brand_update = { sid: brand.sid, status: brand.status }
    } catch (e: any) {
      results.brand_update_error = e.message
    }

    // Step 2: Create Customer Profile for A2P
    try {
      // Check existing customer profiles
      const profiles = await client.trusthub.v1.customerProfiles.list({ limit: 10 })
      results.existing_profiles = profiles.map((p: any) => ({
        sid: p.sid,
        name: p.friendlyName,
        status: p.status,
      }))

      // Create new if needed
      if (!profiles.length || !profiles.find((p: any) => p.status === 'complete')) {
        const cp = await client.trusthub.v1.customerProfiles.create({
          email: 'jstringscode@gmail.com',
          friendlyName: 'Lynch Wedding',
          policySid: 'RNdfbf3fae0e1107f8ded2d079c00ee187',
        })
        results.customer_profile = { sid: cp.sid, status: cp.status }
      }
    } catch (e: any) {
      results.customer_profile_error = e.message
    }

    // Step 3: Assign phone to messaging service (core fix for error 30034)
    try {
      const updated = await client.incomingPhoneNumbers(phoneSid)
        .update({ messagingServiceSid: messagingSid })
      results.phone_to_service = {
        sid: updated.sid,
        messagingServiceSid: updated.messagingServiceSid,
      }
    } catch (e: any) {
      results.phone_to_service_error = e.message
    }

    // Step 4: Register A2P campaign under the messaging service
    try {
      const campaign = await client.messaging.v1
        .services(messagingSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: trustProductSid,
          description: 'Wedding RSVP confirmations and event reminders sent to guests who opt in via houseoflynch.app RSVP form. Guests can reply STOP to opt out at any time. Sole proprietor.',
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',
          hasEmbeddedLinks: true,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP! We look forward to celebrating with you. Reply STOP to opt out.',
            'Reminder: Wedding this Saturday at 4 PM. See houseoflynch.app for details. Reply STOP to opt out.',
          ],
          messageFlow: 'Guest opts in by providing phone number on RSVP form at houseoflynch.app. Receives confirmation message after RSVP. Week-of reminder sent before wedding. Guest can text STOP to opt out at any time.',
        })
      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      if (e.code) results.campaign_error_code = e.code
      if (e.moreInfo) results.campaign_more_info = e.moreInfo
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}