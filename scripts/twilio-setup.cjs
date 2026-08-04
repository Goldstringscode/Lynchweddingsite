// Twilio A2P setup for lynchweddingsite
// Creates Messaging Service, registers A2P campaign on approved brand, assigns phone.
require('dotenv').config({ path: '.env.production' });
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !phoneNumber) {
  console.error('Missing Twilio env vars. Run `vercel env pull .env.production --environment=production` first.');
  process.exit(1);
}

const BRAND_REG_SID = 'BN49efd1b2f418dccb5e7cc63cf941e8cf';
const PHONE_SID = 'PNe5483979c99796ebdd37a89c95f6252a';
const SERVICE_NAME = 'Lynch Wedding SMS';
const PRIVACY_URL = 'https://houseoflynch.app/privacy';
const TERMS_URL = 'https://houseoflynch.app/terms';

const client = twilio(accountSid, authToken);

async function main() {
  // 1. Create Messaging Service (idempotent-ish: skip if exists)
  let service;
  try {
    service = await client.messaging.v1.services.create({
      friendlyName: SERVICE_NAME,
      // NOTE: do NOT set usecase — curl register needs 'undeclared' for compliance
    });
    console.log('✓ Messaging Service created:', service.sid);
  } catch (e) {
    if (e.code === 20001 || /already exists/i.test(e.message)) {
      const list = await client.messaging.v1.services.list({ limit: 1, friendlyName: SERVICE_NAME });
      service = list[0];
      console.log('→ Messaging Service already exists:', service.sid);
    } else {
      throw e;
    }
  }

  const serviceSid = service.sid;

  // 2. Register A2P 10DLC campaign (US app to person compliance)
  //    This links the approved brand with the messaging service.
  try {
    const compliance = await client.messaging.v1
      .services(serviceSid)
      .usAppToPerson
      .create({
        brandRegistrationSid: BRAND_REG_SID,
        description: 'Wedding RSVP confirmations, event reminders, and thank-you texts sent to wedding guests with their explicit opt-in consent via the RSVP form and website.',
        usAppToPersonUsecase: 'SOLE_PROPRIETOR',
        hasEmbeddedLinks: false,
        hasEmbeddedPhone: false,
        messageFlow: `Guest opts in via the RSVP form on houseoflynch.app. Send RSVP confirmation, then reminder texts before the wedding. Guests can text STOP to opt out at any time.`,
        messageSamples: [
          "Hi {Name}, you are confirmed for An Evening Draped in Black! Reply STOP to opt out.",
          "Reminder: our wedding is this Saturday at 3:30 PM. We can't wait to celebrate with you! Reply STOP to opt out.",
        ],
        privacyPolicyUrl: PRIVACY_URL,
        termsAndConditionsUrl: TERMS_URL,
      });
    console.log('✓ A2P campaign registered:');
    console.log('   sid:', compliance.sid);
    console.log('   status:', compliance.campaignStatus);
  } catch (e) {
    console.log('✗ Campaign registration failed:', e.message);
    if (e.details) console.log(JSON.stringify(e.details, null, 2));
  }

  // 3. Assign phone number to the messaging service (use PN SID)
  try {
    const assigned = await client.incomingPhoneNumbers(PHONE_SID).update({
      messagingServiceSid: serviceSid,
    });
    console.log('✓ Phone number linked to service:', assigned.messagingServiceSid);
  } catch (e) {
    console.log('✗ Number assignment failed:', e.message);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});