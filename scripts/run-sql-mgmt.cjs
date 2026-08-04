// Run SQL migration via Supabase Management API using extracted CLI token
const fs = require('fs');
const path = require('path');

const TOKEN = fs.readFileSync(path.join(__dirname, '..', 'supabase', '.temp', 'access-token'), 'utf8').trim();
const PROJECT_REF = 'asnkchxmqanvdljzgshv';

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
  console.log('Token prefix:', TOKEN.slice(0, 6), 'len:', TOKEN.length);
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });
  const text = await res.text();
  console.log('Management API status:', res.status);
  console.log('Response:', text.slice(0, 800));
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});