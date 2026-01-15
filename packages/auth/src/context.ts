export type Role = "user" | "admin" | "system";

export interface AuthContext {
  subject: {
    userId: string;
    tenantId: string;
    role: Role;
  };
  permissions: Set<string>;
}
