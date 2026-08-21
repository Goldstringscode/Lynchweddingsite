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
    const campaignSid = 'QE2c6890da8086d771620e9b13fadeba0b'

    // Step 1: Force assign phone to messaging service
    try {
      await client.incomingPhoneNumbers(phoneSid)
        .update({ messagingServiceSid: msgSid })
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone = {
        number: phone.phoneNumber,
        serviceAssigned: phone.messagingServiceSid === msgSid,
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    // Step 2: Check campaign status
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson(campaignSid)
        .fetch()
      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
    }

    // Step 3: Send a TEST SMS
    try {
      const sent = await client.messages.create({
        messagingServiceSid: msgSid,
        body: '✅ Twilio A2P campaign active! Your wedding SMS is now fully operational. Reply STOP to opt out.',
        to: '+14795307328',
        statusCallback: 'https://houseoflynch.app/api/sms/status',
      })
      results.test_sms = {
        sid: sent.sid,
        status: sent.status,
        errorCode: sent.errorCode,
        errorMessage: sent.errorMessage,
      }
    } catch (e: any) {
      results.test_sms_error = e.message
      results.test_sms_code = e.code
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}