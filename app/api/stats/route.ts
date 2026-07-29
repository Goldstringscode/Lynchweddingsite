import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: guests, error: gErr } = await supabaseAdmin.from('guests').select('*')
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 })

  const { data: vendors, error: vErr } = await supabaseAdmin.from('vendors').select('fee, status')
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

  const { data: invoices, error: iErr } = await supabaseAdmin.from('invoices').select('amount, status')
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 })

  const totalGuests = guests.reduce((sum, g) => sum + g.guest_count, 0)
  const confirmedGuests = guests.filter(g => g.is_attending).reduce((sum, g) => sum + g.guest_count, 0)
  const checkedIn = guests.filter(g => g.check_in).length
  const rsvpCount = guests.filter(g => g.is_attending).length
  const totalVendorCost = vendors.reduce((sum, v) => sum + (v.fee || 0), 0)
  const confirmedVendors = vendors.filter(v => v.status === 'confirmed').length
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.amount), 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0)
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