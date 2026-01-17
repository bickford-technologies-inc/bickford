import { INVARIANTS } from "./registry";

export function runInvariants(state: State, action?: Action) {
  const failures = [];

  for (const inv of INVARIANTS) {
    const res = inv.assert(state, action);
    if (!res.ok) {
      failures.push({
        invariant: inv.id,
        reason: res.reason
      });
    }
  }

  return failures;
}
