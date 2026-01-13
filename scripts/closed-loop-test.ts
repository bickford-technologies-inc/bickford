// Closed-loop sustainment test: runtime failure triggers new intent, processed through full loop
import { ingestFromRuntime } from "../packages/bickford/intent/ingest/runtime";
import { processIntent } from "../packages/bickford/optr/intent-optr-wire";
import { persistLedgerEntry } from "./ledger-persist";

export async function testClosedLoopSustainment() {
  // Simulate a runtime failure
  const runtimeEvent = {
    goal: "Restore system to healthy state",
    constraints: ["no downtime"],
    canonRefs: ["CANON_HEALTH"],
    urgency: "critical",
    errorClass: "BuildFailure",
    logs: "TS7016: Could not find a declaration file for module...",
    timestamp: new Date().toISOString(),
  };
  // 1. Ingest as intent
  const intent = ingestFromRuntime(runtimeEvent);
  // 2. Process through OPTR + canon
  const { paths, chosen, result } = await processIntent(intent);
  // 3. Persist to ledger
  await persistLedgerEntry({
    intentId: intent.id,
    decision: result.allowed ? "allowed" : "denied",
    pathChosen: chosen.kind,
    allowed: result.allowed,
    evidence: runtimeEvent,
    timestamp: intent.createdAt,
    hash: "test-hash-" + Date.now(),
  });
  return { intent, paths, chosen, result };
}
