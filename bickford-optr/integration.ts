// Bun-native script for integrating OPTR ledger with customer workflow
import { readFile } from "bun";

export async function recordCustomerDecision(customer: string, action: string) {
  // Append a new event to the OPTR ledger
  const ledgerPath = "./bickford-optr/production_ledger.jsonl";
  const ledgerText = await readFile(ledgerPath).text();
  const ledger = ledgerText
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const previousHash = ledger.length
    ? ledger[ledger.length - 1].currentHash
    : "0".repeat(64);
  const timestamp = new Date().toISOString();
  const event = {
    timestamp,
    event: "customer_decision",
    payload: { customer, action },
    previousHash,
    currentHash: "",
  };
  const hashInput =
    previousHash +
    JSON.stringify({
      timestamp,
      event: "customer_decision",
      payload: { customer, action },
    });
  const { createHash } = await import("crypto");
  event.currentHash = createHash("sha256").update(hashInput).digest("hex");
  ledger.push(event);
  await Bun.write(ledgerPath, ledger.map((e) => JSON.stringify(e)).join("\n"));
  console.log(`Recorded decision for ${customer}: ${action}`);
}
