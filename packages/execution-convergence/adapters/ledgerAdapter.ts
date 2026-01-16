// Append-only ledger adapter for execution-convergence
// This is a stub for future implementation

import { LockedArtifact } from "../src/types";

export interface LedgerAdapter {
  append(artifact: LockedArtifact): Promise<void>;
  getByHash(hash: string): Promise<LockedArtifact | null>;
}

export class InMemoryLedgerAdapter implements LedgerAdapter {
  private store = new Map<string, LockedArtifact>();

  async append(artifact: LockedArtifact): Promise<void> {
    this.store.set(artifact.hash, artifact);
  }

  async getByHash(hash: string): Promise<LockedArtifact | null> {
    return this.store.get(hash) || null;
  }
}
