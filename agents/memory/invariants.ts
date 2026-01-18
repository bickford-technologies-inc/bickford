import { MemoryRecord } from "./types";

export function assertPromotable(record: MemoryRecord): void {
  if (!record.content) {
    throw new Error("Memory promotion denied: empty content");
  }

  if (record.level !== "ephemeral") {
    throw new Error("Only ephemeral memory may be promoted");
  }
}
