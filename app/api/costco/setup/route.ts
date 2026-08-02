import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST() {
  try {
    // Create the costco_product_mappings table via raw SQL
    // Using supabaseAdmin which has service_role privileges
    const { error: createError } = await supabaseAdmin.rpc("exec_sql", {
      sql_string: `
        CREATE TABLE IF NOT EXISTS costco_product_mappings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          ingredient_name text NOT NULL UNIQUE,
          search_query text NOT NULL,
          costco_product_name text,
          costco_item_number text,
          current_price numeric(10,2),
          last_checked timestamptz,
          price_history jsonb DEFAULT '[]'::jsonb,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })

    if (createError) {
      // Try alternative: create table via raw query
      const { error: directError } = await supabaseAdmin.from("costco_product_mappings").select("id").limit(1)
      if (directError && directError.code === "PGRST205") {
        return NextResponse.json({ 
          error: "Table needs to be created in Supabase dashboard. Run this SQL:",
          sql: `CREATE TABLE IF NOT EXISTS costco_product_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name text NOT NULL UNIQUE,
  search_query text NOT NULL,
  costco_product_name text,
  costco_item_number text,
  current_price numeric(10,2),
  last_checked timestamptz,
  price_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`
        }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, message: "Table exists" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}