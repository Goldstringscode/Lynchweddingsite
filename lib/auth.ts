import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Reusable admin session check for API route handlers.
 *
 * Call at the top of any admin-only route:
 *   const authError = await authenticateAdmin()
 *   if (authError) return authError
 *
 * The session cookie is set by POST /api/admin/login with:
 *   httpOnly, secure, sameSite: 'lax', path: '/', maxAge: 24h
 */
export async function authenticateAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // authenticated — continue to handler
}