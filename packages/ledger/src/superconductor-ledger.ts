import { createHash } from "crypto";
import { MerkleTree } from "./merkle-tree";
import { BICKFORD_ROOT } from "./bickford-root";
import { Decision } from "./reconstruction-engine";

export interface LedgerEntry {
  decision: Decision;
  hash: Buffer;
  previousHash: Buffer;
  timestamp: number;
}

export class SuperconductorLedger {
  private entries: LedgerEntry[] = [];
  private merkleTree: MerkleTree;

  constructor() {
    this.merkleTree = new MerkleTree([]); // Start empty, not with [BICKFORD_ROOT]
  }

  append(decision: Decision): LedgerEntry {
    const previousHash =
      this.entries.length === 0
        ? BICKFORD_ROOT
        : this.entries[this.entries.length - 1].hash;

    const hash = createHash("sha256")
      .update(previousHash)
      .update(JSON.stringify(decision))
      .digest();

    const entry: LedgerEntry = {
      decision,
      hash,
      previousHash,
      timestamp: Date.now(),
    };

    this.entries.push(entry);
    this.merkleTree.append(hash);

    return entry;
  }

  getMerkleRoot(): Buffer {
    return this.merkleTree.getRoot();
  }

  getEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  verifyIntegrity(): boolean {
    // 1. Check hash chain
    let currentHash = BICKFORD_ROOT;
    for (const entry of this.entries) {
      const expectedHash = createHash("sha256")
        .update(currentHash)
        .update(JSON.stringify(entry.decision))
        .digest();
      if (!expectedHash.equals(entry.hash)) {
        return false;
      }
      currentHash = entry.hash;
    }
    // 2. Check Merkle root matches the tree of all entry hashes
    if (this.entries.length === 0) return true;
    const hashes = this.entries.map((e) => e.hash);
    const merkle = new MerkleTree(hashes);
    return this.getMerkleRoot().equals(merkle.getRoot());
  }
}
