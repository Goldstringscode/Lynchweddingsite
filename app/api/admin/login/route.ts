import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signToken, ADMIN_SESSION_COOKIE } from '@/lib/auth'
import { timingSafeEqual } from 'node:crypto'

// Simple in-memory rate limiter: max 5 attempts per IP per 15 minutes.
// (Vercel serverless is ephemeral — this throttles casual brute force;
//  for hard guarantees add a store like Upstash Redis.)
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function rateLimitExceeded(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_ATTEMPTS
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { password } = body

  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
  }

  // Rate-limit by IP to slow brute-force attacks.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  if (rateLimitExceeded(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  if (typeof password !== 'string' || !safeEqual(password, adminPassword)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Set a signed session cookie — expires in 24 hours.
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return NextResponse.json({ success: true })
}
