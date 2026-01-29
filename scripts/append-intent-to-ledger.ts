import { writeFileSync, appendFileSync } from "fs";
import { join } from "path";

export function appendIntentToLedger(intent: any) {
  const ledgerPath = join(__dirname, "../ledger/decisions.jsonl");
  appendFileSync(ledgerPath, JSON.stringify(intent) + "\n");
}

export function persistIntentBronze(intent: any) {
  const bronzeDir = join(__dirname, "../datalake/bronze/messages");
  const filePath = join(bronzeDir, `${intent.id}.json`);
  writeFileSync(filePath, JSON.stringify(intent, null, 2));
}
