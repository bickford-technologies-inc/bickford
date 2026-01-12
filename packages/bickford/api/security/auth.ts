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

function getAuthMode() {
  return (process.env.AUTH_MODE || "jwt").toLowerCase(); // "jwt" | "none"
}

function getJwtConfig() {
  return {
    issuer: process.env.JWT_ISSUER || "",
    audience: process.env.JWT_AUDIENCE || "",
    secret: process.env.JWT_SECRET || "", // HS256 secret (v1)
    publicKey: process.env.JWT_PUBLIC_KEY || "", // RS256 public key (optional)
  };
}

function getToken(req: Request): string | null {
  const h = req.header("authorization") || req.header("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function verifyJwt(token: string) {
  const { issuer, audience, secret, publicKey } = getJwtConfig();
  // v1: HS256 OR RS256 (public key)
  const key = publicKey || secret;
  if (!key) throw new Error("JWT key not configured (JWT_SECRET or JWT_PUBLIC_KEY)");
  const decoded = jwt.verify(token, key, {
    issuer: issuer || undefined,
    audience: audience || undefined,
  });
  return decoded as any;
}

type PublicRouteRule = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  match: "exact" | "prefix";
};

// Lightweight demo allowlist so the repo runs without a JWT in Codespaces.
// Keep this small and explicit.
const PUBLIC_ROUTES: PublicRouteRule[] = [
  { method: "GET", path: "/api/ready", match: "exact" },
  { method: "GET", path: "/api/health", match: "exact" },
  { method: "GET", path: "/api/derek/summary", match: "exact" },
  { method: "GET", path: "/metrics", match: "exact" },
  { method: "GET", path: "/api/session-completion/metrics", match: "exact" },
  { method: "POST", path: "/api/session-completion/events", match: "exact" },
  { method: "GET", path: "/api/session-completion/recent", match: "exact" },
  { method: "GET", path: "/api/filing/folders", match: "exact" },
  { method: "POST", path: "/api/filing/ledger/append", match: "exact" },
  { method: "POST", path: "/api/filing/chat", match: "exact" },
  { method: "GET", path: "/api/filing/ledger/recent", match: "exact" },
  { method: "GET", path: "/api/filing/state", match: "exact" },
  { method: "GET", path: "/api/filing/stream", match: "exact" },
  { method: "POST", path: "/api/filing/promote", match: "exact" },
  { method: "GET", path: "/api/filing/anchor", match: "exact" },
  { method: "GET", path: "/api/filing/knowledge", match: "exact" },
  { method: "POST", path: "/api/filing/export/investor-report", match: "exact" },
  { method: "POST", path: "/api/filing/export/pitch-deck", match: "exact" },
];

function isPublicRoute(req: Request) {
  const method = String(req.method || "").toUpperCase();
  const path = req.path || req.url || "";

  // Static web UI assets / SPA routes should be public.
  // Keep auth enforcement focused on the API surface.
  if (!path.startsWith("/api") && path !== "/metrics") return true;

  return PUBLIC_ROUTES.some((r) => {
    if (r.method && r.method !== method) return false;
    if (r.match === "exact") return path === r.path;
    return path.startsWith(r.path);
  });
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
  if (getAuthMode() === "none") return next();

  if (isPublicRoute(req)) return next();

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
