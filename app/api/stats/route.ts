import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { authenticateAdmin } from '@/lib/auth'

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError

  const { data: guests, error: gErr } = await supabaseAdmin.from('guests').select('*')
  if (gErr) {
    console.error('Stats guests error:', gErr.message)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }

  // Vendors and invoices are optional — don't fail if tables don't exist
  const { data: vendors } = await supabaseAdmin.from('vendors').select('fee, status')
  const { data: invoices } = await supabaseAdmin.from('invoices').select('amount, status')

  const totalGuests = guests.reduce((sum, g) => sum + g.guest_count, 0)
  const confirmedGuests = guests.filter(g => g.is_attending).reduce((sum, g) => sum + g.guest_count, 0)
  const checkedIn = guests.filter(g => g.check_in).length
  const rsvpCount = guests.filter(g => g.is_attending).length
  const totalVendorCost = (vendors || []).reduce((sum, v) => sum + (v.fee || 0), 0)
  const confirmedVendors = (vendors || []).filter(v => v.status === 'confirmed').length
  const totalInvoiced = (invoices || []).reduce((sum, i) => sum + Number(i.amount), 0)
  const totalPaid = (invoices || []).filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0)
  const outstanding = totalInvoiced - totalPaid

  return NextResponse.json({
    totalGuests,
    confirmedGuests,
    checkedIn,
    rsvpCount,
    totalVendorCost,
    confirmedVendors,
    totalInvoiced,
    totalPaid,
    outstanding,
  })
}