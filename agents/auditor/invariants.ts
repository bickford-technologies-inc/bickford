export type AuditRecord = {
  subject: string;
  // ...other fields as needed
};

export function assertAudit(record: AuditRecord) {
  if (!record.subject) throw new Error("Audit subject required");
}
