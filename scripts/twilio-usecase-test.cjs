const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const SERVICE_SID = 'MGdb42d9ca2ded9f248d45f8fe042eaf57';
const BRAND_REG_SID = 'BN49efd1b2f418dccb5e7cc63cf941e8cf';

// Valid A2P 10DLC use cases for SOLE_PROPRIETOR brands
const useCases = [
  'SOLE_PROPRIETOR', 'SOLE_PROPRIETOR_MARKETING', 'SOLE_PROPRIETOR_NOTIFICATIONS',
  'SOLE_PROPRIETOR_2FA', 'SOLE_PROPRIETOR_CUSTOMER_CARE', 'SOLE_PROPRIETOR_ACCOUNT_NOTIFICATION',
  'SOLE_PROPRIETOR_FRAUD_ALERT', 'SOLE_PROPRIETOR_EMERGENCY', 'SOLE_PROPRIETOR_POLLING'
];

async function main() {
  for (const ucase of useCases) {
    try {
      const c = await client.messaging.v1.services(SERVICE_SID).usAppToPerson.create({
        brandRegistrationSid: BRAND_REG_SID,
        description: 'Wedding RSVP confirmations, event reminders, and thank-you texts sent to wedding guests with their explicit opt-in consent via the RSVP form.',
        usAppToPersonUsecase: ucase,
        hasEmbeddedLinks: false,
        hasEmbeddedPhone: false,
        messageFlow: 'Guest opts in via RSVP form on houseoflynch.app. Send confirmation, then reminder before wedding. Reply STOP to opt out.',
        messageSamples: [
          'Your RSVP is confirmed. We can\'t wait to celebrate! Reply STOP to opt out.',
          'Reminder: our wedding is this Saturday at 3:30 PM. Reply STOP to opt out.',
        ],
        privacyPolicyUrl: 'https://houseoflynch.app/privacy',
        termsAndConditionsUrl: 'https://houseoflynch.app/terms',
      });
      console.log(`✓ SUCCESS with use case '${ucase}': sid=${c.sid} status=${c.campaignStatus}`);
      return;
    } catch (e) {
      if (e.code === 21720) {
        console.log(`  ✗ '${ucase}' invalid (21720)`);
      } else {
        console.log(`  ? '${ucase}' → code=${e.code} msg=${e.message}`);
      }
    }
  }
  console.log('\nNo valid use case found in batch.');
}

main().catch(e => console.error('Fatal:', e.message));