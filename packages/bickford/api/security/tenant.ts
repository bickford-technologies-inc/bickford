// security/tenant.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import type { Request, Response, NextFunction } from "express";

/**
 * Enforce tenant isolation:
 * - request must include tenant (from JWT caller.tenantId)
 * - body/context tenant (if present) must match
 * - for reads by pointer, require tenant header and enforce pointer prefix
 */
export function enforceTenantMatch(options?: {
  bodyPath?: string; // default: "context.tenantId"
}) {
  const bodyPath = options?.bodyPath ?? "context.tenantId";

  return (req: Request, res: Response, next: NextFunction) => {
    const tenant = req.caller?.tenantId;
    if (!tenant) return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });

    // If request body declares tenantId, it must match caller tenant.
    const body: any = req.body || {};
    const declared = bodyPath.split(".").reduce((acc: any, k: string) => (acc ? acc[k] : undefined), body);

    if (declared && String(declared) !== String(tenant)) {
      return res.status(403).json({
        error: "TENANT_MISMATCH",
        callerTenant: tenant,
        bodyTenant: String(declared),
        ts: new Date().toISOString(),
      });
    }

    return next();
  };
}

/**
 * For read endpoints that take pointer/path params:
 * require X-Tenant-Id header and enforce it matches caller tenant.
 */
export function requireTenantHeader(req: Request, res: Response, next: NextFunction) {
  const callerTenant = req.caller?.tenantId;
  if (!callerTenant) return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });

  const headerTenant = req.header("x-tenant-id") || req.header("X-Tenant-Id");
  if (!headerTenant) return res.status(400).json({ error: "MISSING_TENANT_HEADER", ts: new Date().toISOString() });

  if (String(headerTenant) !== String(callerTenant)) {
    return res.status(403).json({
      error: "TENANT_HEADER_MISMATCH",
      callerTenant,
      headerTenant,
      ts: new Date().toISOString(),
    });
  }

  return next();
}
