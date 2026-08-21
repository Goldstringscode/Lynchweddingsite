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

    // Check: What brand registrations exist?
    try {
      const brands = await client.trusthub.v1.trustProducts.list({ limit: 20 })
      results.brands = brands.map((b: any) => ({
        sid: b.sid,
        name: b.friendlyName,
        status: b.status,
      }))
    } catch (e: any) {
      results.brands_error = e.message
    }

    // Check: can we submit an approved trust product to become a brand?
    const trustSid = 'BU401a2703ec03dc76d7e30da1e1126156'
    try {
      const tp = await client.trusthub.v1.trustProducts(trustSid).fetch()
      results.trust_product = { sid: tp.sid, name: tp.friendlyName, status: tp.status }
      
      // Submit for brand if not yet done
      if (tp.status === 'twilio-approved') {
        try {
          const brandReg = await client.trusthub.v1.trustProducts(trustSid)
            .update({ status: 'in-review' })
          results.submission = { sid: brandReg.sid, status: brandReg.status }
        } catch (err: any) {
          results.submission_error = err.message
        }
      }
    } catch (e: any) {
      results.trust_product_error = e.message
    }

    // Check: any service-level A2P campaigns already?
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    try {
      const campaigns = await client.messaging.v1.services(msgSid).usAppToPerson.list()
      results.service_campaigns = campaigns.map((c: any) => ({
        sid: c.sid,
        campaignStatus: c.campaignStatus,
        brandRegistrationSid: c.brandRegistrationSid,
      }))
    } catch (e: any) {
      results.service_campaigns_error = e.message
    }

    // Check the phone status
    try {
      const phone = await client.incomingPhoneNumbers('PNe5483979c99796ebdd37a89c95f6252a').fetch()
      results.phone = {
        number: phone.phoneNumber,
        sms: phone.capabilities.sms,
        messagingServiceSid: phone.messagingServiceSid,
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}