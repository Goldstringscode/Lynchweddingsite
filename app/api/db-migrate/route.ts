import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { authenticateAdmin } from '@/lib/auth'

export const dynamic = "force-dynamic"

export async function GET() {
  const authError = await authenticateAdmin()
  if (authError) return authError
  const sql = `
      CREATE TABLE IF NOT EXISTS wedding_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        email_notifications BOOLEAN DEFAULT true,
        wedding_date TEXT DEFAULT '2026-09-26',
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      INSERT INTO wedding_settings (id, email_notifications, wedding_date)
      VALUES (1, true, '2026-09-26')
      ON CONFLICT (id) DO NOTHING;
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pricing_breakdown JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ingredient_details JSONB DEFAULT '[]'::jsonb;
    `;
  
  // Try via rpc
  const { error: rpcErr } = await supabaseAdmin.rpc("exec_sql", { sql_text: sql });
  if (!rpcErr) return NextResponse.json({ ok: true, method: "rpc" });
  
  // Try creating exec_sql function
  const createFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
    RETURNS void AS $fn$
    BEGIN EXECUTE sql_text; END;
    $fn$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  // Use raw query via the REST API directly
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Prefer": "params=single-object"
    }
  });
  
  return NextResponse.json({ 
    status: res.status, 
    statusText: res.statusText,
    note: "Need to run ALTER TABLE manually or via dashboard SQL editor",
    sql
  });
}