import { createHash } from "crypto";

export interface LedgerEntry {
  eventType: string;
  payload: any;
  metadata?: any;
  timestamp: string;
  previousHash?: string;
  currentHash?: string;
}

export class Ledger {
  private entries: LedgerEntry[] = [];

  async append(entry: Omit<LedgerEntry, "previousHash" | "currentHash">) {
    const previousHash = this.entries.length
      ? this.entries[this.entries.length - 1].currentHash
      : "0".repeat(64);
    const currentHash = createHash("sha256")
      .update(previousHash + JSON.stringify(entry))
      .digest("hex");
    const fullEntry: LedgerEntry = {
      ...entry,
      previousHash,
      currentHash,
    };
    this.entries.push(fullEntry);
    // Optionally: persist to disk or database
  }

  getAll(): LedgerEntry[] {
    return this.entries;
  }

  verifyIntegrity(): { valid: boolean; violations: number } {
    let prev = "0".repeat(64);
    let violations = 0;
    for (const e of this.entries) {
      const expected = createHash("sha256")
        .update(
          prev +
            JSON.stringify({
              ...e,
              previousHash: undefined,
              currentHash: undefined,
            }),
        )
        .digest("hex");
      if (e.previousHash !== prev || e.currentHash !== expected) {
        violations++;
      }
      prev = e.currentHash!;
    }
    return { valid: violations === 0, violations };
  }
}
