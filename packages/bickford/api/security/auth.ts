// security/auth.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type Caller = {
  issuer: string;
  tenantId: string;
  callerType: "model" | "agent" | "human" | "system";
  callerId?: string;
  scopes: string[];
};

declare global {
  namespace Express {
    interface Request {
      caller?: Caller;
      requestId?: string;
    }
  }
}

const AUTH_MODE = (process.env.AUTH_MODE || "jwt").toLowerCase(); // "jwt" | "none"
const JWT_ISSUER = process.env.JWT_ISSUER || "";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "";
const JWT_SECRET = process.env.JWT_SECRET || ""; // HS256 secret (v1)
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY || ""; // RS256 public key (optional)

function getToken(req: Request): string | null {
  const h = req.header("authorization") || req.header("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function verifyJwt(token: string) {
  // v1: HS256 OR RS256 (public key)
  const key = JWT_PUBLIC_KEY || JWT_SECRET;
  if (!key) throw new Error("JWT key not configured (JWT_SECRET or JWT_PUBLIC_KEY)");
  const decoded = jwt.verify(token, key, {
    issuer: JWT_ISSUER || undefined,
    audience: JWT_AUDIENCE || undefined,
  });
  return decoded as any;
}

/**
 * Expected JWT claims:
 * - iss
 * - tenant_id
 * - caller_type
 * - caller_id (optional)
 * - scopes: string[] OR scope: "space delimited"
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (AUTH_MODE === "none") return next();

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });

  try {
    const claims = verifyJwt(token);

    const scopes: string[] =
      Array.isArray(claims.scopes)
        ? claims.scopes
        : typeof claims.scope === "string"
          ? claims.scope.split(/\s+/).filter(Boolean)
          : [];

    const caller: Caller = {
      issuer: String(claims.iss || ""),
      tenantId: String(claims.tenant_id || claims.tenantId || ""),
      callerType: (claims.caller_type || claims.callerType || "system") as Caller["callerType"],
      callerId: claims.caller_id || claims.callerId,
      scopes,
    };

    if (!caller.tenantId) {
      return res.status(401).json({ error: "MISSING_TENANT_CLAIM", ts: new Date().toISOString() });
    }

    req.caller = caller;
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: "INVALID_TOKEN", message: e?.message, ts: new Date().toISOString() });
  }
}

export function requireScopes(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const caller = req.caller;
    if (!caller) return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });

    const have = new Set(caller.scopes || []);
    const missing = required.filter((s) => !have.has(s));
    if (missing.length) {
      return res.status(403).json({
        error: "FORBIDDEN",
        missingScopes: missing,
        ts: new Date().toISOString(),
      });
    }
    return next();
  };
}
