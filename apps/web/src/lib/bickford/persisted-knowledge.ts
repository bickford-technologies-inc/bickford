import { append } from "./ledger";

type Decision = {
  intent: string;
  proposal: string;
  executed: boolean;
  ttvDelta: number | null;
};

export async function persistDecision(d: Decision & { agentId?: string }) {
  // Append to in-memory ledger
  append({
    ts: Date.now(),
    agentId: d.agentId || "human-1",
    intent: d.intent,
    proposal: d.proposal,
  });
  // Later:
  // - write to ledger
  // - compute OPTR score
  // - gate canon promotion
  console.log("Bickford persisted decision:", d);
}
