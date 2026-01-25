// Monetization Orchestrator: Automate end-to-end SMS monetization pipeline
// Usage: bun run scripts/monetization-orchestrator.ts
import { execSync } from "child_process";
import { existsSync } from "fs";

const BATCH_CSV = "recipients.csv";
const CRM_CSV = "crm-contacts.csv";
const SENT_CSV = "sent.csv";
const RESULTS_CSV = "results.csv";

function run(cmd: string) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
  }
}

// 1. Send batch SMS if recipients.csv exists
if (existsSync(BATCH_CSV)) {
  run(`bun run scripts/send-batch-monetization-sms.ts ${BATCH_CSV}`);
}
// 2. Send CRM SMS if crm-contacts.csv exists
if (existsSync(CRM_CSV)) {
  run(
    `bun run scripts/send-monetization-sms-from-crm.ts ${CRM_CSV} "AI Compliance Consulting" "https://buy.stripe.com/your-link"`,
  );
}
// 3. Track all sends
if (existsSync(SENT_CSV)) {
  run(
    `bun run scripts/track-sms-monetization-results.ts ${SENT_CSV} ${RESULTS_CSV}`,
  );
}
// 4. Auto-update delivery status
if (existsSync(RESULTS_CSV)) {
  run(`bun run scripts/auto-update-sms-results-from-twilio.ts ${RESULTS_CSV}`);
}
// 5. (Optional) Monitor specific SIDs (add your SIDs below)
// run('bun run scripts/monitor-sms-delivery-status.ts SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

console.log(
  "\n✅ Monetization pipeline executed. Check results.csv for analytics and follow-up.",
);
