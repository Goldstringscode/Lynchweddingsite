const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://asnkchxmqanvdljzgshv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_secret_tM5ALPnz-OOn2ukcRQaWIQ_cH80GyHm'
)

async function test() {
  // Just get all menu items and verify we can read them
  const { data, error } = await supabase.from('menu_items').select('id, name, section, price').limit(5);
  if (error) console.log('ERROR:', error.message);
  else console.log('Items:', JSON.stringify(data, null, 2));
  
  // Check drafts
  const { data: d } = await supabase.from('menu_drafts').select('*').limit(2);
  if (d) console.log('Drafts:', d.length);
  else console.log('No drafts or error');
}
test();