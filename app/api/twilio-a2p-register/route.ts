import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// READ-ONLY: checks campaign status, does NOT modify anything
export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'

    // Check ALL campaigns on this messaging service
    try {
      const existing = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .list()
      results.campaigns = existing.map((c: any) => ({
        sid: c.sid,
        status: c.campaignStatus,
        brandSid: c.brandRegistrationSid,
        created: c.dateCreated?.toISOString(),
      }))
    } catch (e: any) {
      results.campaigns_error = e.message
    }

    // Check phone status
    try {
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone = {
        number: phone.phoneNumber,
        sms: phone.capabilities.sms,
        messagingServiceSid: phone.messagingServiceSid || 'none',
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    // Check messaging service
    try {
      const svc = await client.messaging.v1.services(msgSid).fetch()
      results.messaging_service = {
        name: svc.friendlyName,
        sid: svc.sid,
        inboundUrl: svc.inboundRequestUrl || 'none',
      }
    } catch (e: any) {
      results.service_error = e.message
    }

    // Check account balance
    try {
      const bal = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).balance.fetch()
      results.balance = { amount: bal.balance, currency: bal.currency }
    } catch (e: any) {
      results.balance_error = e.message
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}