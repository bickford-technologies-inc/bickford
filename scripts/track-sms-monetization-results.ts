// CLI script: Track SMS monetization results (logs to CSV)
// Usage: bun run scripts/track-sms-monetization-results.ts sent.csv results.csv
import { readFileSync, writeFileSync, existsSync } from "fs";

if (process.argv.length < 4) {
  console.error(
    "Usage: bun run scripts/track-sms-monetization-results.ts <sent.csv> <results.csv>",
  );
  process.exit(1);
}

const sentPath = process.argv[2];
const resultsPath = process.argv[3];

const sent = readFileSync(sentPath, "utf-8").trim().split("\n");
const results = existsSync(resultsPath)
  ? readFileSync(resultsPath, "utf-8").trim().split("\n")
  : ["phone,product,paymentLink,name,sentAt,delivered,replied,closed,amount"];

const sentMap = new Map();
for (const line of sent) {
  const [phone, product, paymentLink, name, sentAt] = line
    .split(",")
    .map((s) => s.trim());
  if (!phone) continue;
  sentMap.set(phone, { phone, product, paymentLink, name, sentAt });
}

// Merge with previous results
const updated: string[] = [results[0]];
const seen = new Set();
for (let i = 1; i < results.length; ++i) {
  const [phone] = results[i].split(",");
  if (sentMap.has(phone)) {
    updated.push(results[i]);
    seen.add(phone);
  }
}
// Add new sent entries
for (const [phone, row] of sentMap.entries()) {
  if (!seen.has(phone)) {
    updated.push(
      [
        row.phone,
        row.product,
        row.paymentLink,
        row.name,
        row.sentAt || new Date().toISOString(),
        "",
        "",
        "",
        "",
      ].join(","),
    );
  }
}
writeFileSync(resultsPath, updated.join("\n") + "\n");
console.log(`Results updated: ${resultsPath}`);
