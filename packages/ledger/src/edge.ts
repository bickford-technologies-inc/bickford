/**
 * Edge-compatible ledger API
 * INVARIANT: This module MUST NOT import Prisma Client
 * 
 * For Edge runtimes (Vercel Edge, Cloudflare Workers), use fetch-based API calls
 * to ledger endpoints instead of direct database access.
 */

import type { Intent, Decision, LedgerEntry } from "@bickford/types";

export class EdgeLedgerClient {
  private apiUrl: string;
  private apiToken?: string;

  constructor(config: { apiUrl: string; apiToken?: string }) {
    this.apiUrl = config.apiUrl;
    this.apiToken = config.apiToken;
  }

  async appendLedger(intent: Intent, decision: Decision): Promise<LedgerEntry> {
    const response = await fetch(`${this.apiUrl}/ledger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiToken && { Authorization: `Bearer ${this.apiToken}` }),
      },
      body: JSON.stringify({ intent, decision }),
    });

    if (!response.ok) {
      throw new Error(`Failed to append ledger: ${response.statusText}`);
    }

    return response.json();
  }

  async getLedger(limit: number = 100): Promise<LedgerEntry[]> {
    const response = await fetch(`${this.apiUrl}/ledger?limit=${limit}`, {
      headers: {
        ...(this.apiToken && { Authorization: `Bearer ${this.apiToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get ledger: ${response.statusText}`);
    }

    return response.json();
  }
}

// Runtime check to ensure we're in an Edge environment
export function assertEdgeRuntime(): void {
  const isEdge =
    typeof EdgeRuntime !== "undefined" ||
    (globalThis as any).EdgeRuntime ||
    process.env.NEXT_RUNTIME === "edge" ||
    process.env.VERCEL_EDGE === "1";

  if (!isEdge) {
    console.warn(
      "Warning: @bickford/ledger/edge loaded in non-edge environment. " +
      "Consider using @bickford/ledger instead for better performance."
    );
  }
}

export { Intent, Decision, LedgerEntry };
