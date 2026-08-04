// Extract supabase CLI access token from keytar and run migration via Management API
const keytar = require('keytar');
const fs = require('fs');
const os = require('os');
const path = require('path');

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
  const creds = await keytar.findCredentials('supabase');
  if (!creds.length) {
    console.log('No supabase credentials found in keytar');
    process.exit(1);
  }
  const token = creds[0].password;
  console.log('Token len:', token.length, 'prefix:', token.slice(0, 6));

  // Run SQL via Supabase Management API
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });
  const text = await res.text();
  console.log('Management API status:', res.status);
  console.log('Response:', text.slice(0, 500));
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});