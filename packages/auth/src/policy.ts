import { AuthContext } from "./context";

export function requirePermission(ctx: AuthContext, permission: string) {
  if (!ctx.permissions.has(permission)) {
    throw new Error(`FORBIDDEN: ${permission}`);
  }
}
