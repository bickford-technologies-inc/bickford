// CLI script: Auto-update SMS results CSV with Twilio delivery status
// Usage: bun run scripts/auto-update-sms-results-from-twilio.ts results.csv
import { readFileSync, writeFileSync } from "fs";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error("Twilio credentials not set in environment variables");
  process.exit(1);
}

if (process.argv.length < 3) {
  console.error(
    "Usage: bun run scripts/auto-update-sms-results-from-twilio.ts <results.csv>",
  );
  process.exit(1);
}

const resultsPath = process.argv[2];
const lines = readFileSync(resultsPath, "utf-8").trim().split("\n");
const header = lines[0].split(",");
const sidIdx = header.indexOf("sid");
const deliveredIdx = header.indexOf("delivered");

if (sidIdx === -1) {
  console.error(
    "No 'sid' column in results CSV. Add a 'sid' column with Twilio message SIDs.",
  );
  process.exit(1);
}

async function getStatus(sid: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${sid}.json`;
  const res = await fetch(url, {
    headers: {
      Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
    },
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.status;
}

async function main() {
  const updated = [lines[0]];
  for (let i = 1; i < lines.length; ++i) {
    const cols = lines[i].split(",");
    const sid = cols[sidIdx];
    if (!sid) {
      updated.push(lines[i]);
      continue;
    }
    const status = await getStatus(sid);
    if (deliveredIdx !== -1) cols[deliveredIdx] = status;
    updated.push(cols.join(","));
  }
  writeFileSync(resultsPath, updated.join("\n") + "\n");
  console.log(`Results auto-updated: ${resultsPath}`);
}

main();
