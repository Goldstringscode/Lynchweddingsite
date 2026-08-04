// Twilio status check: messaging service, A2P campaign, phone members, balance.
// Credentials come from .env.production (gitignored) — never hardcode secrets.
require('dotenv').config({ path: '.env.production' });
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

if (!accountSid || !authToken || !SERVICE_SID) {
  console.error('Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID in .env.production');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function main() {
  // 1. Messaging service + campaign
  const service = await client.messaging.v1.services(SERVICE_SID).fetch();
  console.log('=== Messaging Service ===');
  console.log('  sid:', service.sid);
  console.log('  name:', service.friendlyName);

  // 2. Campaign status
  const a2p = await client.messaging.v1.services(SERVICE_SID).usAppToPerson.list({ limit: 5 });
  console.log('\n=== A2P 10DLC Campaign ===');
  for (const c of a2p) {
    console.log('  sid:', c.sid);
    console.log('  status:', c.campaignStatus);
    console.log('  brand:', c.brandRegistrationSid);
    console.log('  usecase:', c.usAppToPersonUsecase);
    console.log('  createdAt:', c.dateCreated.toISOString());
  }

  // 3. Phone members
  const members = await client.messaging.v1.services(SERVICE_SID).phoneNumbers.list({ limit: 10 });
  console.log('\n=== Phone Numbers in Service ===');
  for (const m of members) console.log('  ', m.phoneNumber);

  // 4. Account balance
  const bal = await client.api.accounts(accountSid).balance.fetch();
  console.log('\n=== Account ===');
  console.log('  balance:', bal.balance, bal.currency);
}

main().catch(e => console.error('Fatal:', e.message));
