// CLI script: Send monetization SMS to contacts exported from a CRM CSV
// Usage: bun run scripts/send-monetization-sms-from-crm.ts crm-contacts.csv "AI Compliance Consulting" "https://buy.stripe.com/your-link"
import { sendMonetizationSms } from "../adapters/sms-monetization-workflow";
import { readFileSync } from "fs";

if (process.argv.length < 5) {
  console.error(
    "Usage: bun run scripts/send-monetization-sms-from-crm.ts <crm-contacts.csv> <product> <paymentLink>",
  );
  process.exit(1);
}

const csvPath = process.argv[2];
const product = process.argv[3];
const paymentLink = process.argv[4];

const csv = readFileSync(csvPath, "utf-8");
const lines = csv.trim().split("\n");

for (const line of lines) {
  // Assume CSV: name,phone,email,...
  const [name, phone] = line.split(",").map((s) => s.trim());
  if (!phone) {
    console.error(`Skipping invalid line: ${line}`);
    continue;
  }
  sendMonetizationSms({ to: phone, product, paymentLink, name })
    .then(() => console.log(`✅ SMS sent to ${phone} (${product})`))
    .catch((err) =>
      console.error(`❌ Failed to send SMS to ${phone}:`, err.message),
    );
}
