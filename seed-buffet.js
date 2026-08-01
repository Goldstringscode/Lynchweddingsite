// Run: node seed-buffet.js
// PREREQUISITE: Run the SQL from supabase-buffet-schema.sql in Supabase dashboard first
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
let key = '', url = '';
for (const l of lines) {
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY')) key = l.split('=')[1].replace(/^"|"$/g, '').trim();
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL')) url = l.split('=')[1].replace(/^"|"$/g, '').trim();
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const items = JSON.parse(fs.readFileSync('seed-buffet-data.json', 'utf8'));
  console.log(`Seeding ${items.length} buffet items...`);

  // Check if table exists
  const { error: checkErr } = await supabase.from('buffet_items').select('id').limit(1);
  if (checkErr && checkErr.code === 'PGRST205') {
    console.log('❌ Table buffet_items does not exist!');
    console.log('Run this SQL in Supabase dashboard first:');
    console.log('https://supabase.com/dashboard/project/asnkchxmqanvdljzgshv/sql/new');
    console.log('');
    console.log('========================================');
    console.log(fs.readFileSync('supabase-buffet-schema.sql', 'utf8').trim());
    console.log('========================================');
    return;
  }

  // Clear existing data
  await supabase.from('buffet_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleared existing buffet items');

  // Insert in batches
  const batchSize = 10;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize).map(item => ({
      ...item,
      is_available: true,
      is_signature: false,
      suggested_menu_price: item.price_per_person,
      sort_order: i,
      ingredient_links: JSON.stringify(item.ingredient_links || {}),
      ingredient_list: JSON.stringify(item.ingredient_list || []),
      pricing_breakdown: JSON.stringify(item.pricing_breakdown || {}),
      nutrition: JSON.stringify(item.nutrition || {}),
    }));
    
    const { error } = await supabase.from('buffet_items').insert(batch);
    if (error) {
      console.error(`Batch ${i}-${i+batchSize} error:`, error.message.substring(0, 100));
    } else {
      console.log(`  ✅ Inserted ${batch.length} items (${Math.min(i + batchSize, items.length)}/${items.length})`);
    }
  }
  console.log('🎉 Done! Refresh the menu builder page to see buffet items.');
}

main().catch(console.error);