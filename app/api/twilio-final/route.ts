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
    const msgSid = 'MG367b0d85f21a31f2379232122fb7ce24'
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'
    const brandSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'

    // STEP 1: Nuke ALL existing campaigns on this messaging service
    try {
      const existing = await client.messaging.v1.services(msgSid).usAppToPerson.list()
      results.found = existing.length
      for (const c of existing) {
        try {
          await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
          results.removed = results.removed || []
          results.removed.push(c.sid)
        } catch (e: any) {
          results.removeErrors = results.removeErrors || []
          results.removeErrors.push(`${c.sid}: ${e.message}`)
        }
      }
    } catch (e: any) {
      results.listError = e.message
    }

    // STEP 2: Assign phone to messaging service
    try {
      await client.incomingPhoneNumbers(phoneSid).update({ messagingServiceSid: msgSid })
      const phone = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phoneOnService = phone.messagingServiceSid === msgSid
    } catch (e: any) {
      results.phoneError = e.message
    }

    // STEP 3: Create ONE clean Sole Proprietor campaign
    try {
      const campaign = await client.messaging.v1.services(msgSid).usAppToPerson.create({
        brandRegistrationSid: brandSid,
        description: 'Wedding event communications. Sole proprietor sending RSVP confirmations and event reminders to wedding guests who provided phone number and explicit consent via the RSVP form at houseoflynch.app. Opt-in only, not marketing.',
        usAppToPersonUsecase: 'SOLE_PROPRIETOR',
        hasEmbeddedLinks: false,
        hasEmbeddedPhone: false,
        messageSamples: [
          'Thank you for your RSVP! We look forward to celebrating with you on Sept 26. Reply STOP to opt out.',
          'Reminder: Nikkita & Justin wedding this Saturday at 4 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
        ],
        messageFlow: 'Guest provides phone number on RSVP form at houseoflynch.app and explicitly consents to receive wedding text messages. Couple manually sends confirmations and reminders through the admin dashboard. Guest can reply STOP at any time to opt out.',
      })

      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
        useCase: 'SOLE_PROPRIETOR',
      }
    } catch (e: any) {
      results.campaignError = e.message
      results.campaignErrorCode = e.code
      if (e.moreInfo) results.campaignMoreInfo = e.moreInfo
    }

    // STEP 4: If campaign created, send test SMS
    if (results.campaign && !results.campaignError) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Lynch Wedding SMS confirmed. Reply STOP to opt out. Msg & data rates may apply.',
          to: '+14795307328',
          statusCallback: 'https://houseoflynch.app/api/sms/status',
        })
        results.testSMS = {
          sid: sent.sid,
          status: sent.status,
          error: sent.errorCode,
        }
      } catch (e: any) {
        results.testSMSError = e.message
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
  }
}