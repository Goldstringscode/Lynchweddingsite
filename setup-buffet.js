// Run: node setup-buffet.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let key = '', url = '';
for (const l of lines) {
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY')) key = l.split('=')[1].replace(/^"|"$/g, '').trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL')) url = l.split('=')[1].replace(/^"|"$/g, '').trim();
}

const projectRef = url.replace('https://', '').replace('.supabase.co', '');
console.log('Project ref:', projectRef);

// First: use the raw Supabase Database API (pg) via fetch to create tables
// The Supabase project exposes pg via the cloud-sql-proxy or pooler
// Use the API approach: POST to /rest/v1/ with Prefer header

async function createExecSql() {
  // Try to create exec_sql function via raw REST call with service_role key
  // We can try the /pg/ endpoint or use the GraphQL endpoint
  console.log('Attempting to create exec_sql function via REST API...');
  
  // Method 1: Use the @supabase/realtime-js or raw fetch 
  // Supabase has a hidden /api/ endpoint for pg
  const res1 = await fetch(`${url}/rest/v1/`, {
    method: 'GET',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log('REST root status:', res1.status);
  
  // Method 2: Try /api/pg or /api/sql
  for (const endpoint of ['/api/pg', '/api/sql', '/pg', '/sql', '/api/v1/sql', '/api/v1/pg']) {
    try {
      const r = await fetch(`${url}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'apikey': key, 
          'Authorization': `Bearer ${key}` 
        },
        body: JSON.stringify({ query: 'SELECT 1 as test' })
      });
      const text = await r.text();
      console.log(`${endpoint}: ${r.status} - ${text.substring(0, 100)}`);
    } catch(e) {
      console.log(`${endpoint}: error - ${e.message}`);
    }
  }
}

async function createViaGraphql() {
  // Method 3: Try the GraphQL endpoint for mutations
  const gqlEndpoint = `${url}/graphql/v1`;
  try {
    const r = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        query: `
          mutation {
            createTable(name: "buffet_items")
          }
        `
      })
    });
    const text = await r.text();
    console.log('GraphQL:', text.substring(0, 200));
  } catch(e) {
    console.log('GraphQL error:', e.message);
  }
}

async function createViaFetch() {
  // Method 4: Direct insert into a "query" or "_sql" table
  // This is a known Supabase trick - there's a `_sql` table in some versions
  const endpoints = [
    `${url}/rest/v1/_sql`,
    `${url}/rest/v1/query`,
    `${url}/rest/v1/sql`,
    `${url}/rest/v1/exec`,
    `${url}/api/sql`,
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'tx=commit'
        },
        body: JSON.stringify({ 
          query: `CREATE TABLE IF NOT EXISTS test_conn (id serial primary key, name text); DROP TABLE IF EXISTS test_conn;`
        })
      });
      const text = await r.text();
      console.log(`${ep}: ${r.status} - ${text.substring(0, 100)}`);
      if (r.ok) {
        console.log('✅ SQL execution endpoint found!');
        return ep;
      }
    } catch(e) {
      console.log(`${ep}: error - ${e.message}`);
    }
  }
  return null;
}

async function createViaPooler() {
  // Method 5: Use TCP connection to Supabase pooler
  // postgresql://postgres.[project-ref]:[service-role-key]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
  const region = 'us-west-1'; // guess
  const poolerUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(key)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  console.log('Trying pooler connection...');
  
  // Try to find the right region
  const regions = ['us-west-1', 'us-east-1', 'us-east-2', 'eu-west-1', 'eu-central-1'];
  for (const reg of regions) {
    const purl = `postgresql://postgres.${projectRef}:${encodeURIComponent(key)}@aws-0-${reg}.pooler.supabase.com:6543/postgres`;
    try {
      // Quick TCP check
      const [host, port] = purl.match(/@([^:]+):(\d+)/).slice(1);
      console.log(`Trying ${host}:${port} (${reg})`);
      // We can't easily do raw TCP from Node.js without a library
    } catch(e) {}
  }
}

async function main() {
  console.log('=== Trying to create buffet tables via Supabase API ===\n');
  
  // Try GraphQL
  await createViaGraphql();
  console.log();
  
  // Try fetch-based endpoints
  const found = await createViaFetch();
  console.log();
  
  if (!found) {
    // Fall back to the simplest approach: use @supabase/auth-ui or format
    console.log('❌ Could not find a DDL execution endpoint.');
    console.log('The Supabase dashboard SQL editor is required.');
    console.log('');
    console.log('📋 Please go to:');
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('');
    console.log('📝 Then paste the ENTIRE contents of buffet-complete-setup.sql');
    console.log('   This file is at: C:\\Users\\Justin\\sites\\lynchweddingsite\\buffet-complete-setup.sql');
    console.log('');
    console.log('   Or paste this simpler version:');
    
    // Print a simpler CREATE TABLE
    console.log('');
    console.log('=== SIMPLER SQL (copy this) ===');
    console.log(`
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buffet_items ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.buffet_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT DEFAULT '',
  guest_count INTEGER DEFAULT 150, stations JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_cost_per_person DECIMAL(10,2) DEFAULT 0, total_menu_cost DECIMAL(10,2) DEFAULT 0,
  is_locked BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buffet_menus ENABLE ROW LEVEL SECURITY;
`);
  }
}

main().catch(console.error);