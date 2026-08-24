import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

// One-time admin endpoint: clear all guest RSVPs
// Delete this route after use!
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const authError = await authenticateAdmin()
  if (authError) return NextResponse.json({ error: authError }, { status: 401 })

  // First count
  const { count: before } = await supabaseAdmin.from('guests')
    .select('*', { count: 'exact', head: true })

  // Delete all
  const { error } = await supabaseAdmin.from('guests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { count: after } = await supabaseAdmin.from('guests')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    success: true,
    deleted: before,
    remaining: after,
    message: `Cleared ${before} guest RSVPs. Table is clean.`
  })
}