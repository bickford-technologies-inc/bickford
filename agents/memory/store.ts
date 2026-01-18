import { MemoryRecord } from "./types";

const memory: MemoryRecord[] = [];

export function append(record: MemoryRecord) {
  memory.push(record);
}

export function list() {
  return [...memory];
}

export function byLevel(level: MemoryRecord["level"]) {
  return memory.filter((m) => m.level === level);
}
