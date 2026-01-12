/**
 * Hash-Linked Append-Only Ledger
 * TIMESTAMP: 2026-01-12T03:06:00Z
 * 
 * Immutable ledger with SHA-256 hash chaining.
 * Each entry links to previous hash, ensuring tamper-evidence.
 */

import * as crypto from "crypto";
import { LedgerEvent } from "../canon/types";

export type LedgerEntry = {
  event: LedgerEvent;
  hash: string;
  previousHash: string;
  index: number;
  timestamp: string;
};

export class HashLinkedLedger {
  private entries: LedgerEntry[] = [];
  private genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Append an event to the ledger
   * Returns the ledger entry with hash
   */
  append(event: LedgerEvent): LedgerEntry {
    const previousHash = this.entries.length > 0 
      ? this.entries[this.entries.length - 1].hash 
      : this.genesisHash;
    
    const index = this.entries.length;
    const timestamp = new Date().toISOString();
    
    // Create deterministic hash: previous + index + event data
    const data = JSON.stringify({
      previousHash,
      index,
      event,
      timestamp
    });
    
    const hash = crypto
      .createHash("sha256")
      .update(data)
      .digest("hex");

    const entry: LedgerEntry = {
      event,
      hash,
      previousHash,
      index,
      timestamp
    };

    this.entries.push(entry);
    return entry;
  }

  /**
   * Verify ledger integrity
   * Returns true if all hashes are valid
   */
  verify(): boolean {
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.entries[i - 1].hash;
      
      if (entry.previousHash !== expectedPrevHash) {
        return false;
      }

      // Recompute hash
      const data = JSON.stringify({
        previousHash: entry.previousHash,
        index: entry.index,
        event: entry.event,
        timestamp: entry.timestamp
      });
      
      const computedHash = crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");

      if (entry.hash !== computedHash) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get all ledger entries
   */
  getEntries(): ReadonlyArray<LedgerEntry> {
    return this.entries;
  }

  /**
   * Get entry by index
   */
  getEntry(index: number): LedgerEntry | undefined {
    return this.entries[index];
  }

  /**
   * Get the latest entry
   */
  getLatest(): LedgerEntry | undefined {
    return this.entries.length > 0 
      ? this.entries[this.entries.length - 1] 
      : undefined;
  }

  /**
   * Get ledger size
   */
  size(): number {
    return this.entries.length;
  }
}
