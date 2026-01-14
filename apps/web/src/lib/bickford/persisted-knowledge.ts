import { persist } from "./history";

type Decision = {
  intent: string;
  proposal: string;
  executed: boolean;
  ttvDelta: number | null;
};

export async function persistDecision(d: Decision & { agentId?: string }) {
  // Persist to in-memory history
  persist({
    ts: Date.now(),
    agentId: d.agentId || "human-1",
    intent: d.intent,
    proposal: d.proposal,
  });
  // Later:
  // - write to history
  // - compute score
  // - gate rule promotion (UI surface only)
  console.log("Bickford persisted decision:", d);
}
