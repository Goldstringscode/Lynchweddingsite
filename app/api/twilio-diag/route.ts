import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = twilio(accountSid, authToken)

    // Get account info
    const acct = await client.api.accounts(accountSid).fetch()
    results.account = { 
      friendly_name: acct.friendlyName, 
      status: acct.status, 
      type: acct.type 
    }

    // Get phone numbers
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 })
    results.phone_numbers = numbers.map((n: any) => ({
      phone: n.phoneNumber,
      sid: n.sid,
      sms: n.capabilities.sms,
      voice: n.capabilities.voice,
      mms: n.capabilities.mms,
    }))

    // Get messaging services
    const services = await client.messaging.v1.services.list({ limit: 10 })
    results.messaging_services = services.map((s: any) => ({
      sid: s.sid,
      name: s.friendlyName,
      inbound_enabled: s.inboundRequestUrl !== null,
    }))

    // Check A2P / regulatory compliance
    try {
      // Check Trust Hub
      const trustProducts = await client.trusthub.v1.trustProducts.list({ limit: 10 })
      results.trust_products = trustProducts.map((t: any) => ({
        sid: t.sid,
        name: t.friendlyName,
        status: t.status,
      }))
    } catch (e: any) {
      results.trust_products_error = e.message
    }

    // Check campaigns
    try {
      const campaigns = await client.messaging.v1.usAppToPerson.list({ limit: 10 })
      results.campaigns = campaigns.map((c: any) => ({
        sid: c.sid,
        status: c.campaignStatus,
        messaging_service_sid: c.messagingServiceSid,
        description: c.description?.slice(0, 80),
      }))
    } catch (e: any) {
      results.campaigns_error = e.message
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}