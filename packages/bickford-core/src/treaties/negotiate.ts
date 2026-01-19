import { Treaty } from "./types";

export function negotiateTreaty(t: Treaty) {
  for (const inv of t.invariants) {
    if (!inv.nonInterference || inv.maxRisk > 0.1) {
      throw new Error(`Treaty violation: ${inv.id}`);
    }
  }
  return { ...t, signedAt: new Date().toISOString() };
}
