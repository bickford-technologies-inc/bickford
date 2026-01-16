import fs from "fs";
import { allowAlert } from "./alertRateLimit";
import { notifySlack } from "./notifySlack";
import { notifyPagerDuty } from "./notifyPagerDuty";
import { append } from "./ledger";

const cfg = JSON.parse(
  fs.readFileSync("infra/alerts/tenants.json", "utf8")
).tenants;

export async function dispatchAlert(evt) {
  const t = cfg[evt.tenantId];
  if (!t) return;

  if (!allowAlert(evt.tenantId, t.rateLimit.perMinute)) {
    return;
  }

  if (t.slack) {
    await notifySlack(
      process.env[t.slack.webhook],
      t.slack.channel,
      `🚨 *${evt.title}*\n${evt.message}`
    );
  }

  if (t.pagerduty) {
    const sev = t.pagerduty.severity?.[evt.kind] ?? "error";
    await notifyPagerDuty(process.env[t.pagerduty.integrationKey], {
      severity: sev,
      summary: evt.title,
      source: "bickford",
      custom_details: evt.details,
    });
  }

  append({
    ts: evt.ts,
    kind: "DECISION",
    intentId: `alert:${evt.kind}`,
    commit: "runtime",
    env: evt.tenantId,
    details: evt,
  });
}
