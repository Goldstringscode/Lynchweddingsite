import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_LOGIN_PATH = '/admin/login'
const ADMIN_API_PATH = '/api/admin'
const ADMIN_PATH = '/admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (not login page or admin API)
  if (!pathname.startsWith(ADMIN_PATH)) return NextResponse.next()
  if (pathname === ADMIN_LOGIN_PATH) return NextResponse.next()
  if (pathname.startsWith(ADMIN_API_PATH)) return NextResponse.next()

  // Check for admin session cookie
  const session = request.cookies.get('admin_session')?.value

  if (!session) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}