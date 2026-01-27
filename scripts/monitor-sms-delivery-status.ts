// CLI script: Monitor Twilio SMS delivery status for monetization
// Usage: bun run scripts/monitor-sms-delivery-status.ts <sid1> <sid2> ...
// (You can get SIDs from Twilio API or logs)

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error("Twilio credentials not set in environment variables");
  process.exit(1);
}

const sids = process.argv.slice(2);
if (sids.length === 0) {
  console.error(
    "Usage: bun run scripts/monitor-sms-delivery-status.ts <sid1> <sid2> ...",
  );
  process.exit(1);
}

async function checkStatus(sid: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${sid}.json`;
  const res = await fetch(url, {
    headers: {
      Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
    },
  });
  if (!res.ok) {
    console.error(`❌ Failed to fetch status for ${sid}: ${res.status}`);
    return;
  }
  const data = await res.json();
  console.log(
    `SID: ${sid} | Status: ${data.status} | To: ${data.to} | Sent: ${data.date_sent}`,
  );
}

Promise.all(sids.map(checkStatus)).then(() => process.exit(0));
