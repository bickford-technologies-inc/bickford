import { Plan } from "./types";
import { assertPlan } from "./invariants";

export function createPlan(intent: string, steps: string[]): Plan {
  const plan: Plan = {
    id: crypto.randomUUID(),
    intent,
    steps,
    ts: Date.now(),
  };
  assertPlan(plan);
  return plan;
}
