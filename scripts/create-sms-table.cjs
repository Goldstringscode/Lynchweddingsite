// Creates sms_messages table for delivery status tracking.
// Reads values directly from .env.local (dotenv won't override pre-set shell vars).
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
const SUPABASE_URL = clean(envLocal.NEXT_PUBLIC_SUPABASE_URL) || 'https://asnkchxmqanvdljzgshv.supabase.co';
const SERVICE_KEY = clean(envLocal.SUPABASE_SERVICE_ROLE_KEY);

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
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing Supabase env vars. Check .env.local');
    process.exit(1);
  }
  console.log('URL:', SUPABASE_URL);
  console.log('KEY ready, len:', SERVICE_KEY.length);

  // Ensure exec_sql function exists
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({
      sql_text: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_text text)
        RETURNS void AS $fn$ BEGIN EXECUTE sql_text; END;
        $fn$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    }),
  }).catch((e) => console.log('fn setup:', e.message));

  // Run migration
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ sql_text: SQL }),
  });
  const text = await res.text();
  console.log('Migration response:', res.status, text.slice(0, 300));

  // Verify
  const verify = await fetch(`${SUPABASE_URL}/rest/v1/sms_messages?select=id&limit=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const vt = await verify.text();
  console.log('Verify sms_messages:', verify.status, vt.slice(0, 200));
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});