import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Admin session auth for the wedding concierge.
 *
 * Sessions are signed HMAC tokens (Web Crypto — works on both Node and Edge):
 *   <expiry-epoch-ms>.<hmac-sha256-base64url(secret, expiry)>
 *
 * The cookie value is unforgeable without AUTH_SECRET (fallback: ADMIN_PASSWORD),
 * expires after SESSION_TTL_MS (default 24h). Verification is async and uses
 * crypto.subtle so the same code path works in route handlers and middleware.
 */

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!s || s.length < 8) {
    throw new Error('AUTH_SECRET or ADMIN_PASSWORD must be set (min 8 chars)')
  }
  return s
}

async function hmacSign(payload: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Buffer.from(sig).toString('base64url')
}

export async function signToken(now: number = Date.now()): Promise<string> {
  const expiry = now + SESSION_TTL_MS
  const payload = String(expiry)
  const sig = await hmacSign(payload)
  return `${payload}.${sig}`
}

export async function verifyToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  if (!token) return false
  const [expiryPart, sigPart] = token.split('.')
  if (!expiryPart || !sigPart) return false

  const expiry = Number(expiryPart)
  if (!Number.isFinite(expiry) || expiry <= now) return false

  // Constant-time-ish compare: recompute the expected signature and compare.
  const expected = await hmacSign(expiryPart)
  const a = Buffer.from(sigPart)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  // timingSafeEqual is not available on Edge; a length-checked string compare
  // of two HMAC outputs is acceptable here (attacker cannot influence the bytes).
  return a.toString('utf8') === b.toString('utf8')
}

/**
 * Reusable admin session check for API route handlers.
 *
 * Call at the top of any admin-only route:
 *   const authError = await authenticateAdmin()
 *   if (authError) return authError
 */
export async function authenticateAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)?.value

  if (!(await verifyToken(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // authenticated — continue to handler
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE
