export function assertAudit(record: AuditRecord) {
  if (!record.subject) throw new Error("Audit subject required");
}
