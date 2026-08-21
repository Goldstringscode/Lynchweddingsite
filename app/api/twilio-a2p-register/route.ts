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
    
    const brandSid = 'BN49efd1b2f418dccb5e7cc63cf941e8cf'  // APPROVED
    const msgSid  = 'MG367b0d85f21a31f2379232122fb7ce24'  // Messaging Service
    const phoneSid = 'PNe5483979c99796ebdd37a89c95f6252a'  // +12137742802

    // STEP 1: Assign phone to messaging service FIRST
    try {
      // First fetch current state
      const phoneBefore = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone_before = { svc: phoneBefore.messagingServiceSid || 'none' }
      
      // Force assignment
      await client.incomingPhoneNumbers(phoneSid)
        .update({ messagingServiceSid: msgSid })
      
      // Verify it stuck
      const phoneAfter = await client.incomingPhoneNumbers(phoneSid).fetch()
      results.phone_assigned = {
        number: phoneAfter.phoneNumber,
        service: phoneAfter.messagingServiceSid === msgSid,
        actualSid: phoneAfter.messagingServiceSid || 'none',
      }
    } catch (e: any) {
      results.phone_error = e.message
    }

    // STEP 2: Clean up any failed campaigns on this service
    try {
      const existing = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .list()
      for (const c of existing) {
        try {
          await client.messaging.v1.services(msgSid).usAppToPerson(c.sid).remove()
          results.removed = c.sid
        } catch (e: any) {
          results.remove_error = `${c.sid}: ${e.message}`
        }
      }
    } catch (e: any) {
      results.list_error = e.message
    }

    // STEP 3: Create campaign with proper detailed submission
    try {
      const campaign = await client.messaging.v1
        .services(msgSid)
        .usAppToPerson
        .create({
          brandRegistrationSid: brandSid,
          description: [
            'Wedding RSVP confirmations and event reminders.',
            'Sole proprietor couple sending manual text messages.',
            'Only to guests who provided phone + explicit consent on RSVP form.',
            'NOT marketing — purely operational wedding communications.',
          ].join(' '),
          usAppToPersonUsecase: 'SOLE_PROPRIETOR',  // Brand is Sole Proprietor — must match
          hasEmbeddedLinks: false,
          hasEmbeddedPhone: false,
          messageSamples: [
            'Thank you for your RSVP, {Name}! We look forward to celebrating with you on Sept 26. Reply STOP to opt out of future messages.',
            'Wedding reminder: Nikkita & Justin this Saturday at 4:00 PM. Four Seasons Terra Lago, Indio. Reply STOP to opt out.',
            'See houseoflynch.app for full event details, program, and venue info. Reply STOP to opt out.',
          ],
          messageFlow: [
            'Guest visits houseoflynch.app and completes RSVP form.',
            'Guest provides name, email, and phone (phone optional for SMS).',
            'Guest sees clear disclosure that providing phone = consent to wedding text messages.',
            'After RSVP: couple may send confirmation via admin dashboard.',
            'Before wedding: couple may send reminder.',
            'Guest can reply STOP at any time to unsubscribe. HELP for info.',
            'All messages are sent manually — no automated or recurring campaigns.',
          ].join(' '),
        })
      results.campaign = {
        sid: campaign.sid,
        status: campaign.campaignStatus,
      }
    } catch (e: any) {
      results.campaign_error = e.message
      results.campaign_error_code = e.code
    }

    // STEP 4: If campaign created, send test
    if (results.campaign && !results.campaign_error) {
      try {
        const sent = await client.messages.create({
          messagingServiceSid: msgSid,
          body: '✅ Wedding SMS pipeline verified. Reply STOP to opt out. Msg & data rates may apply.',
          to: '+14795307328',
          statusCallback: 'https://houseoflynch.app/api/sms/status',
        })
        results.test = {
          sid: sent.sid,
          status: sent.status,
          error: sent.errorCode,
        }
      } catch (e: any) {
        results.test_error = e.message
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}