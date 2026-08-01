// Run: node setup-db.js
const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let key = '', url = '';
for (const l of lines) {
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY')) key = l.split('=')[1].replace(/^"|"$/g, '').trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL')) url = l.split('=')[1].replace(/^"|"$/g, '').trim();
}

const projectRef = url.replace('https://', '').replace('.supabase.co', '');
const encodedPass = encodeURIComponent(key);

// Try different regions for the pooler
const regions = ['us-west-1', 'us-east-1', 'us-east-2', 'eu-west-1', 'eu-central-1'];

async function tryRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.${projectRef}:${encodedPass}@${host}:6543/postgres`;
  
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
  
  try {
    const client = await pool.connect();
    console.log(`✅ Connected via ${region} pooler!`);
    
    const createSQL = `
      CREATE TABLE IF NOT EXISTS public.buffet_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category TEXT NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT '',
        section TEXT, nutrition JSONB DEFAULT '{}'::jsonb,
        allergens TEXT[] DEFAULT '{}', season_tags TEXT[] DEFAULT '{}',
        difficulty TEXT DEFAULT 'medium', prep_time INTEGER DEFAULT 30,
        is_signature BOOLEAN DEFAULT false, is_available BOOLEAN DEFAULT true,
        portion_weight_g INTEGER, cost_per_serving DECIMAL(10,2) DEFAULT 0,
        suggested_menu_price DECIMAL(10,2) DEFAULT 0, price_per_person DECIMAL(10,2) DEFAULT 0,
        guest_count_scale INTEGER DEFAULT 10, station_type TEXT DEFAULT 'self-serve',
        ingredient_links JSONB DEFAULT '{}'::jsonb, ingredient_list JSONB DEFAULT '[]'::jsonb,
        pricing_breakdown JSONB DEFAULT '{}'::jsonb,
        dietary_labels TEXT[] DEFAULT '{}', sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE public.buffet_items ENABLE ROW LEVEL SECURITY;
      CREATE TABLE IF NOT EXISTS public.buffet_menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, description TEXT DEFAULT '',
        guest_count INTEGER DEFAULT 150, stations JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_cost_per_person DECIMAL(10,2) DEFAULT 0, total_menu_cost DECIMAL(10,2) DEFAULT 0,
        is_locked BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE public.buffet_menus ENABLE ROW LEVEL SECURITY;
      -- RLS policies
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buffet_items' AND policyname = 'Service role can do everything on buffet_items') THEN
          CREATE POLICY "Service role can do everything on buffet_items" ON buffet_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buffet_menus' AND policyname = 'Service role can do everything on buffet_menus') THEN
          CREATE POLICY "Service role can do everything on buffet_menus" ON buffet_menus FOR ALL TO authenticated USING (true) WITH CHECK (true);
        END IF;
      END $$;
    `;

    await client.query(createSQL);
    console.log('✅ Tables created successfully!');
    
    // Now seed the data
    const items = JSON.parse(fs.readFileSync('seed-buffet-data.json', 'utf8'));
    for (const item of items) {
      await client.query(
        `INSERT INTO public.buffet_items (category, section, name, description, difficulty, prep_time, price_per_person, cost_per_serving, portion_weight_g, nutrition, allergens, season_tags, dietary_labels, station_type, is_available, is_signature, ingredient_links, ingredient_list, pricing_breakdown, suggested_menu_price) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [item.category, item.section, item.name, item.description, item.difficulty, item.prep_time,
         item.price_per_person, item.cost_per_serving, item.portion_weight_g,
         JSON.stringify(item.nutrition || {}), item.allergens || [], item.season_tags || [],
         item.dietary_labels || [], item.station_type || 'self-serve', true, false,
         JSON.stringify(item.ingredient_links || {}), JSON.stringify(item.ingredient_list || []),
         JSON.stringify(item.pricing_breakdown || {}), item.price_per_person]
      );
    }
    console.log(`✅ Seeded ${items.length} buffet items!`);
    
    client.release();
    await pool.end();
    return true;
  } catch (e) {
    console.log(`❌ ${region}: ${e.message.substring(0, 80)}`);
    await pool.end().catch(() => {});
    return false;
  }
}

async function main() {
  console.log('Trying Supabase connection pooler...');
  console.log(`Project: ${projectRef}`);
  
  for (const region of regions) {
    if (await tryRegion(region)) {
      console.log('\n🎉 Buffet system setup complete!');
      console.log('Refresh your menu builder page to see the buffet items.');
      return;
    }
  }
  
  console.log('\n❌ Could not connect via pooler.');
  console.log('The service_role key may not work as a database password for pooler.');
  console.log('');
  console.log('📋 Please go to the Supabase dashboard SQL editor:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('');
  console.log('📝 Copy-paste the contents of: buffet-complete-setup.sql');
  console.log('   (or supabase-buffet-schema.sql + scout/buffet-inserts.sql)');
}

main().catch(console.error);