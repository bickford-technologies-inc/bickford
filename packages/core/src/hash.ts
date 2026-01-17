import crypto from "node:crypto";

export function executionHash(payload: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload, stableReplacer))
    .digest("hex");
}

function stableReplacer(_key: string, value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value;
}
