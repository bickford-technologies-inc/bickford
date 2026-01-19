import fs from "fs";

const ledgerPath = "promotions/ledger.json";
const policy = JSON.parse(fs.readFileSync("promotions/policy.json", "utf8"));
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));

for (const [pkg, state] of Object.entries(ledger)) {
  const rule = policy[state];
  if (!rule) continue;

  if (rule.requires.includes("quorum")) {
    console.log("⬆️ promoting", pkg, "→", rule.promotesTo);
    ledger[pkg] = rule.promotesTo;
  }
}

fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
