// packages/ledger/credential-events.ts
// MVP: Log credential set/rotation events to the ledger
import { appendLedger } from "./index";

export function logCredentialEvent(event: {
  type: "set" | "rotate";
  name: string;
  version: number;
  intentIds?: string[];
  timestamp?: number;
}) {
  appendLedger({
    kind: "credential",
    event,
    timestamp: event.timestamp || Date.now(),
  });
}
