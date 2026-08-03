import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
    }

    const twilio = require('twilio')
    const client = twilio(accountSid, authToken)

    const numbers = Array.isArray(to) ? to : [to]
    const results = []

    for (const phone of numbers) {
      try {
        const sent = await client.messages.create({
          body: message,
          from: fromNumber,
          to: phone,
        })
        results.push({ phone, status: 'sent', sid: sent.sid })
      } catch (err: any) {
        results.push({ phone, status: 'failed', error: err.message })
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}