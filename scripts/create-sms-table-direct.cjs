// Directly test exec_sql RPC and create sms_messages table.
const fs = require('fs');
const path = require('path');
function readEnvFile(file) {
  const env = {};
  try {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch (e) {}
  return env;
}
const clean = (v) => (v || '').replace(/^["']|["']$/g, '').trim();
const envLocal = readEnvFile('.env.local');
const URL = clean(envLocal.NEXT_PUBLIC_SUPABASE_URL) || 'https://asnkchxmqanvdljzgshv.supabase.co';
const KEY = clean(envLocal.SUPABASE_SERVICE_ROLE_KEY);

const SQL = `
CREATE TABLE IF NOT EXISTS sms_messages (
  id BIGSERIAL PRIMARY KEY,
  twilio_sid TEXT UNIQUE,
  to_phone TEXT NOT NULL,
  from_number TEXT,
  body TEXT,
  status TEXT DEFAULT 'queued',
  error_code TEXT,
  error_message TEXT,
  guest_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created ON sms_messages(created_at DESC);
`;

async function main() {
  // Try exec_sql RPC directly
  let res = await fetch(`${URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ sql_text: SQL }),
  });
  let text = await res.text();
  console.log('exec_sql attempt:', res.status, text.slice(0, 300));

  if (!res.ok) {
    // Try alternative: raw postgres via pg. Check if node-postgres available
    console.log('\nexec_sql failed. Trying direct pg connection...');
  }
}
main().catch((e) => console.error('Fatal:', e.message));