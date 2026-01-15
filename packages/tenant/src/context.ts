export interface TenantContext {
  tenantId: string;
  subjectId: string;
  role: "user" | "admin" | "system";
}
