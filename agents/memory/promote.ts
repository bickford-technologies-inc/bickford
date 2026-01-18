import { MemoryRecord, PromotionResult } from "./types";
import { append } from "./store";
import { assertPromotable } from "./invariants";

export function promote(
  record: MemoryRecord,
  to: "promoted" | "canon",
): PromotionResult {
  try {
    assertPromotable(record);

    const promoted: MemoryRecord = {
      ...record,
      level: to,
      ts: Date.now(),
    };

    append(promoted);
    return { ok: true, record: promoted };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
