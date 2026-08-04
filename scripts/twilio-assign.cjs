// Assign a Twilio phone number to the messaging service.
// Credentials come from .env.production (gitignored) — never hardcode secrets.
require('dotenv').config({ path: '.env.production' });
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
// The phone number SID (PN...) of the number to add, if not set the script lists them.
const PHONE_SID = process.env.TWILIO_PHONE_SID;

if (!accountSid || !authToken || !SERVICE_SID) {
  console.error('Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID in .env.production');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function main() {
  try {
    if (PHONE_SID) {
      const member = await client.messaging.v1.services(SERVICE_SID).phoneNumbers.create({
        phoneNumberSid: PHONE_SID,
      });
      console.log('✓ Added phone to messaging service:');
      console.log('  member sid:', member.sid);
      console.log('  phoneNumber:', member.phoneNumber);
    } else {
      console.log('TWILIO_PHONE_SID not set — listing numbers instead.');
    }
  } catch (e) {
    console.log('✗ phoneNumbers.create:', e.code, e.message);
    console.log('  more_info:', e.moreInfo);
  }

  const members = await client.messaging.v1.services(SERVICE_SID).phoneNumbers.list({ limit: 10 });
  console.log('\nService phone members:', members.length);
  for (const m of members) console.log('  ', m.sid, '|', m.phoneNumber);
}

main().catch(e => console.error('Fatal:', e.message));