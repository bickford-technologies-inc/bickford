// Send Anthropic compliance report to Slack via webhook
// Requires SLACK_WEBHOOK_URL environment variable
import { file } from "bun";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
const REPORT_PATH = "outputs/anthropic_auto_compliance_report.md";

async function sendSlackReport() {
  if (!SLACK_WEBHOOK_URL) {
    console.error("SLACK_WEBHOOK_URL not set");
    return;
  }
  const report = await file(REPORT_PATH).text();
  const payload = {
    text: `*Anthropic Automated Compliance Report*\n\n${report.substring(0, 3500)}...`, // Slack message limit
  };
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    console.log("Compliance report sent to Slack");
  } else {
    console.error("Failed to send report to Slack", await response.text());
  }
}

await sendSlackReport();
