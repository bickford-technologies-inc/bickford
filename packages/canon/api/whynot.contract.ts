// whynot.contract.ts
// TIMESTAMP: 2025-12-23T14:09:00-05:00
export type WhyNotResponse =
  | {
      found: true;
      id: string;
      ts?: string;
      kind: "DECIDE" | "PROMOTE" | "NON_INTERFERENCE";
      actionId?: string;
      denialTrace: unknown;
      ledgerPointer?: string;
    }
  | {
      found: false;
      id: string;
      reason: string;
      minimalFix?: string[];
    };

export type LedgerLookupResponse =
  | {
      found: true;
      pointer: string;
      events: unknown[];
    }
  | {
      found: false;
      pointer: string;
      reason: string;
    };
