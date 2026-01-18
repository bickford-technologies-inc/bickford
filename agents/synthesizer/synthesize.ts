import { Synthesis } from "./types";
import { assertSynthesis } from "./invariants";

export function synthesize(inputs: unknown[]): Synthesis {
  const summary = JSON.stringify(inputs);
  assertSynthesis(summary);
  return { summary, ts: Date.now() };
}
