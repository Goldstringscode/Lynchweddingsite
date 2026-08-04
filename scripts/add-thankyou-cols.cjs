// Add guest thank-you tracking columns + sms template column via Supabase Management API
const fs = require('fs');
const path = require('path');

const TOKEN = fs.readFileSync(path.join(__dirname, '..', 'supabase', '.temp', 'access-token'), 'utf8').trim();
const PROJECT_REF = 'asnkchxmqanvdljzgshv';

const SQL = `
ALTER TABLE guests ADD COLUMN IF NOT EXISTS thank_you_sent boolean NOT NULL DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS thank_you_sent_at timestamptz;
ALTER TABLE sms_messages ADD COLUMN IF NOT EXISTS template text;
CREATE INDEX IF NOT EXISTS idx_sms_messages_guest ON sms_messages(guest_id);
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
