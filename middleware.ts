import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_LOGIN_PATH = '/admin/login'
const ADMIN_API_PATH = '/api/admin'
const ADMIN_PATH = '/admin'

/**
 * Verify the signed admin session cookie on the Edge runtime.
 * Same algorithm as lib/auth.ts (HMAC-SHA256 of the expiry payload),
 * implemented with Web Crypto since middleware runs on Edge.
 */
async function verifyToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  if (!token) return false
  const [expiryPart, sigPart] = token.split('.')
  if (!expiryPart || !sigPart) return false

  const expiry = Number(expiryPart)
  if (!Number.isFinite(expiry) || expiry <= now) return false

  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(expiryPart))
  const expected = Buffer.from(sig).toString('base64url')
  return expected === sigPart
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (not login page or admin API)
  if (!pathname.startsWith(ADMIN_PATH)) return NextResponse.next()
  if (pathname === ADMIN_LOGIN_PATH) return NextResponse.next()
  if (pathname.startsWith(ADMIN_API_PATH)) return NextResponse.next()

  // Check for a valid signed admin session cookie
  const session = request.cookies.get('admin_session')?.value

  if (!session || !(await verifyToken(session))) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
