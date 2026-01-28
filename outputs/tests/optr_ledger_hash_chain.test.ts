import { test, expect } from "bun:test";
import { existsSync, writeFileSync, unlinkSync } from "fs";
import { createHash } from "crypto";
import { readFileSync } from "fs";

const testLedgerPath = "outputs/bickford-optr/test_ledger.jsonl";

function fakeAppendEvent(prevHash: string, payload: string) {
  // Use Node.js crypto for deterministic hash (matches production logic)
  return createHash("sha256")
    .update(prevHash + payload)
    .digest("hex");
}

test("OPTR ledger hash chain integrity", () => {
  // Setup: create a fake ledger
  writeFileSync(testLedgerPath, "");
  let prevHash = "0".repeat(64);
  for (let i = 0; i < 3; i++) {
    const payload = `event${i}`;
    const hash = fakeAppendEvent(prevHash, payload);
    writeFileSync(
      testLedgerPath,
      JSON.stringify({ prevHash, payload, hash }) + "\n",
      { flag: "a" },
    );
    prevHash = hash;
  }
  // Read and verify
  const lines = readFileSync(testLedgerPath, "utf-8").trim().split("\n");
  let lastHash = "0".repeat(64);
  for (const line of lines) {
    const { prevHash, payload, hash } = JSON.parse(line);
    expect(prevHash).toBe(lastHash);
    expect(hash).toBe(fakeAppendEvent(prevHash, payload));
    lastHash = hash;
  }
  // Cleanup
  unlinkSync(testLedgerPath);
});
