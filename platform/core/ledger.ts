import { createHash } from "crypto";

export interface LedgerEntry {
  hash: string;
  prevHash: string;
  [key: string]: unknown;
}

export class TamperEvidentLedger {
  private entries: LedgerEntry[] = [];
  private closed = false;

  constructor(private dbPath: string) {}

  async append(entry: Record<string, unknown>): Promise<string> {
    if (this.closed) throw new Error("Ledger is closed");
    const prevHash =
      this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : "";
    const hash = createHash("sha256")
      .update(JSON.stringify(entry) + prevHash)
      .digest("hex");
    this.entries.push({ ...entry, hash, prevHash });
    return hash;
  }

  async getEntries(limit = 100): Promise<LedgerEntry[]> {
    return this.entries.slice(-limit);
  }

  async verifyIntegrity(): Promise<{
    valid: boolean;
    violations: { index: number; entry: LedgerEntry }[];
  }> {
    let valid = true;
    const violations: { index: number; entry: LedgerEntry }[] = [];
    for (let i = 1; i < this.entries.length; i++) {
      const prev = this.entries[i - 1];
      const curr = this.entries[i];
      const expectedHash = createHash("sha256")
        .update(
          JSON.stringify(curr)
            .replace(/,"hash":"[^"]+"/, "")
            .replace(/,"prevHash":"[^"]+"/, "") + prev.hash,
        )
        .digest("hex");
      if (curr.prevHash !== prev.hash || curr.hash !== expectedHash) {
        valid = false;
        violations.push({ index: i, entry: curr });
      }
    }
    return { valid, violations };
  }

  close() {
    this.closed = true;
  }
}
