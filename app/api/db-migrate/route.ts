import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
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
      
        -- Buffet tables
        CREATE TABLE IF NOT EXISTS buffet_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category TEXT NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT '',
          section TEXT, image_url TEXT, nutrition JSONB DEFAULT '{}'::jsonb,
          allergens TEXT[] DEFAULT '{}', season_tags TEXT[] DEFAULT '{}',
          difficulty TEXT DEFAULT 'medium', prep_time INTEGER DEFAULT 30,
          is_signature BOOLEAN DEFAULT false, is_available BOOLEAN DEFAULT true,
          portion_weight_g INTEGER, cost_per_serving DECIMAL(10,2) DEFAULT 0,
          suggested_menu_price DECIMAL(10,2) DEFAULT 0, price_per_person DECIMAL(10,2) DEFAULT 0,
          guest_count_scale INTEGER DEFAULT 10,
          station_type TEXT DEFAULT 'self-serve',
          ingredient_links JSONB DEFAULT '{}'::jsonb, ingredient_list JSONB DEFAULT '[]'::jsonb,
          pricing_breakdown JSONB DEFAULT '{}'::jsonb,
          dietary_labels TEXT[] DEFAULT '{}', sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        ALTER TABLE buffet_items ENABLE ROW LEVEL SECURITY;
      
        CREATE TABLE IF NOT EXISTS buffet_menus (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL, description TEXT DEFAULT '',
          guest_count INTEGER DEFAULT 150, is_locked BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true, total_cost_per_person DECIMAL(10,2) DEFAULT 0,
          total_menu_cost DECIMAL(10,2) DEFAULT 0,
          stations JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        ALTER TABLE buffet_menus ENABLE ROW LEVEL SECURITY;
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