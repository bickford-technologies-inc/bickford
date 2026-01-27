// CLI script: Send a single monetization SMS via Twilio
// Usage: bun run scripts/send-single-monetization-sms.ts "+15551234567" "AI Compliance Consulting" "https://buy.stripe.com/your-link" "John"
import { sendMonetizationSms } from "../adapters/sms-monetization-workflow";

const [, , to, product, paymentLink, name] = process.argv;

if (!to || !product || !paymentLink) {
  console.error(
    "Usage: bun run scripts/send-single-monetization-sms.ts <to> <product> <paymentLink> [name]",
  );
  process.exit(1);
}

sendMonetizationSms({ to, product, paymentLink, name })
  .then(() => console.log(`✅ SMS sent to ${to} (${product})`))
  .catch((err) =>
    console.error(`❌ Failed to send SMS to ${to}:`, err.message),
  );
