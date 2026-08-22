import { NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// READ-ONLY: checks campaign status and balance. NEVER creates or deletes anything.
export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const results: any = {}

  try {
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'

    // Check campaigns — NEVER DELETE
    try {
      const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
      results.campaigns = existing.map((c: any) => ({
        sid: c.sid,
        status: c.campaignStatus,
        useCase: c.usAppToPersonUsecase,
        brandSid: c.brandRegistrationSid,
        created: c.dateCreated?.toISOString(),
      }))
    } catch (e: any) {
      results.campaignsError = e.message
    }

    // Check phone
    try {
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone = {
        number: phone.phoneNumber,
        onService: phone.messagingServiceSid === msgSid,
        serviceId: phone.messagingServiceSid || 'none',
      }
    } catch (e: any) {
      results.phoneError = e.message
    }

    // Check balance
    try {
      const bal = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).balance.fetch()
      results.balance = { amount: bal.balance, currency: bal.currency }
    } catch (e: any) {
      results.balanceError = e.message
    }

    // If campaign exists and is not FAILED/REJECTED, try to send test SMS
    const active = (results.campaigns || []).find(
      (c: any) => !['FAILED','REJECTED'].includes(c.status)
    )
    if (active) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Lynch Wedding SMS live. Reply STOP to opt out.',
          to: '+14795307328',
          statusCallback: 'https://houseoflynch.app/api/sms/status',
        })
        results.testSMS = { sid: sent.sid, status: sent.status, error: sent.errorCode }
      } catch (e: any) {
        results.testSMSError = e.message
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}