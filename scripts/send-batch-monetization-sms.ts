// CLI script: Send batch monetization SMS via Twilio
// Usage: bun run scripts/send-batch-monetization-sms.ts recipients.csv
import { sendMonetizationSms } from "../adapters/sms-monetization-workflow";
import { readFileSync } from "fs";

if (process.argv.length < 3) {
  console.error(
    "Usage: bun run scripts/send-batch-monetization-sms.ts recipients.csv",
  );
  process.exit(1);
}

const csvPath = process.argv[2];
const csv = readFileSync(csvPath, "utf-8");
const lines = csv.trim().split("\n");

for (const line of lines) {
  const [to, product, paymentLink, name] = line.split(",").map((s) => s.trim());
  if (!to || !product || !paymentLink) {
    console.error(`Skipping invalid line: ${line}`);
    continue;
  }
  sendMonetizationSms({ to, product, paymentLink, name })
    .then(() => console.log(`✅ SMS sent to ${to} (${product})`))
    .catch((err) =>
      console.error(`❌ Failed to send SMS to ${to}:`, err.message),
    );
}
