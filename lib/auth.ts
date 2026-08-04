import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Admin session auth for the wedding concierge.
 *
 * Sessions are signed HMAC tokens (no external deps):
 *   <expiry-epoch-ms>.<hmac-sha256(secret, expiry)>
 *
 * The cookie value is unforgeable without AUTH_SECRET (fallback: ADMIN_PASSWORD),
 * expires after SESSION_TTL_MS (default 24h), and is verified with a
 * constant-time comparison.
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

export function signToken(now: number = Date.now()): string {
  const expiry = now + SESSION_TTL_MS
  const payload = String(expiry)
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false
  const [expiryPart, sigPart] = token.split('.')
  if (!expiryPart || !sigPart) return false

  const expiry = Number(expiryPart)
  if (!Number.isFinite(expiry) || expiry <= now) return false

  // Constant-time compare to avoid timing attacks
  const expected = crypto.createHmac('sha256', secret()).update(expiryPart).digest('base64url')
  const a = Buffer.from(sigPart)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
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

  if (!verifyToken(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // authenticated — continue to handler
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE
