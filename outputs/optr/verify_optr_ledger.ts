// Bun-native script to verify hash chain integrity of OPTR ledger
import { file } from "bun";
import { createHash } from "crypto";

const ledgerPath = "outputs/optr/optr_ledger.jsonl";

async function verifyLedger() {
  const lines = (await file(ledgerPath).text()).trim().split("\n");
  let previousHash = "0".repeat(64);
  let valid = true;
  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    const { currentHash, ...rest } = entry;
    const expectedHash = createHash("sha256")
      .update(
        previousHash + JSON.stringify({ ...rest, currentHash: undefined }),
      )
      .digest("hex");
    if (currentHash !== expectedHash) {
      console.error(`Hash mismatch at line ${i + 1}`);
      valid = false;
      break;
    }
    previousHash = currentHash;
  }
  if (valid) {
    console.log(`Ledger is valid. ${lines.length} entries verified.`);
  } else {
    console.error("Ledger integrity check FAILED.");
  }
}

(async () => {
  await verifyLedger();
})();
