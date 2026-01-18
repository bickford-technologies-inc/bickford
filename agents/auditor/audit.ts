import { AuditRecord } from "./types";
import { assertAudit } from "./invariants";

export function audit(subject: string, outcome: string): AuditRecord {
  const record: AuditRecord = {
    id: crypto.randomUUID(),
    subject,
    outcome,
    ts: Date.now(),
  };
  assertAudit(record);
  return record;
}
