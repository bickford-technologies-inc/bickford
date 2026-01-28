import { file } from "bun";
import { createHash } from "crypto";

const ledgerPath = "outputs/optr/optr_ledger.jsonl";

async function analyzeLedger() {
  const lines = (await file(ledgerPath).text()).trim().split("\n");
  let validChain = true;
  let prevHash = "0".repeat(64);
  let compliant = 0;
  let nonCompliant = 0;
  let firstViolation = null;

  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    // Hash chain check
    const expectedHash = createHash("sha256")
      .update(prevHash + JSON.stringify({ ...entry, currentHash: undefined }))
      .digest("hex");
    if (entry.previousHash !== prevHash || entry.currentHash !== expectedHash) {
      validChain = false;
      if (!firstViolation) firstViolation = i + 1;
    }
    prevHash = entry.currentHash;
    // Compliance check
    const decisionText = Array.isArray(entry.decision)
      ? entry.decision[0].text
      : entry.decision;
    if (/COMPLIANT/i.test(decisionText) && !/NON-COMPLIANT/i.test(decisionText))
      compliant++;
    else nonCompliant++;
  }

  console.log(`Ledger entries: ${lines.length}`);
  console.log(`Compliant: ${compliant}`);
  console.log(`Non-compliant: ${nonCompliant}`);
  console.log(`Hash chain valid: ${validChain}`);
  if (!validChain)
    console.log(`First hash chain violation at entry #${firstViolation}`);
}

await analyzeLedger();
