export type MemoryLevel = "ephemeral" | "promoted" | "canon";

export type MemoryRecord = {
  id: string;
  source: string; // agent name or subsystem
  level: MemoryLevel;
  content: unknown;
  ts: number;
};

export type PromotionResult =
  | { ok: true; record: MemoryRecord }
  | { ok: false; reason: string };
