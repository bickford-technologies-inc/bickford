import { createHash } from "crypto";

export interface LedgerEntry {
  eventType: string;
  payload: any;
  metadata?: any;
  timestamp: string;
  previousHash?: string;
  currentHash?: string;
  embedding?: number[]; // Intelligence: vector embedding
}

function simpleEmbedding(text: string): number[] {
  // Deterministic, simple embedding for demo (sum char codes, length, etc.)
  const arr = new Array(8).fill(0);
  for (let i = 0; i < text.length; ++i) {
    arr[i % 8] += text.charCodeAt(i);
  }
  return arr.map(x => x / text.length);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; ++i) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

export class Ledger {
  private entries: LedgerEntry[] = [];

  async append(
    entry: Omit<LedgerEntry, "previousHash" | "currentHash" | "embedding">
  ) {
    const previousHash = this.entries.length
      ? this.entries[this.entries.length - 1].currentHash
      : "0".repeat(64);
    const currentHash = createHash("sha256")
      .update(previousHash + JSON.stringify(entry))
      .digest("hex");
    // Intelligence: generate embedding
    const embedding = simpleEmbedding(JSON.stringify(entry.payload));
    const fullEntry: LedgerEntry = {
      ...entry,
      previousHash,
      currentHash,
      embedding,
    };
    this.entries.push(fullEntry);
    // Optionally: persist to disk or database
  }

  getAll(): LedgerEntry[] {
    return this.entries;
  }

  // Intelligence: find similar entries by payload embedding
  findSimilarEntries(
    payload: any,
    opts?: { limit?: number; minSimilarity?: number }
  ): LedgerEntry[] {
    const embedding = simpleEmbedding(JSON.stringify(payload));
    const scored = this.entries.map((e) => ({
      entry: e,
      sim: e.embedding ? cosineSimilarity(e.embedding, embedding) : 0,
    }));
    scored.sort((a, b) => b.sim - a.sim);
    const minSim = opts?.minSimilarity ?? 0.7;
    const limit = opts?.limit ?? 5;
    return scored.filter((s) => s.sim >= minSim).slice(0, limit).map((s) => s.entry);
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

export function verifyHashChain(entries: Array<any>): {
  valid: boolean;
  violations: number;
} {
  let prev = "0".repeat(64);
  let violations = 0;
  for (const e of entries) {
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
    prev = e.currentHash;
  }
  return { valid: violations === 0, violations };
}
