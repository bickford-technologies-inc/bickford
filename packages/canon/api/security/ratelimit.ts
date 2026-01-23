// security/ratelimit.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

export type RedisRateLimitClient = {
  sendCommand(args: string[]): Promise<unknown>;
};

export function rateLimitRedis(params: {
  redis: RedisRateLimitClient;
  keyPrefix: string; // e.g. "bickford:rl"
  windowSeconds: number; // e.g. 60
  maxRequests: number; // e.g. 600
  routeTag: string; // e.g. "decide"
}) {
  const limiter = rateLimit({
    windowMs: params.windowSeconds * 1000,
    limit: params.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const tenantId = (req as Request).caller?.tenantId;
      return `${params.keyPrefix}:${tenantId ?? "anonymous"}:${params.routeTag}`;
    },
    handler: (req, res) => {
      const tenantId = (req as Request).caller?.tenantId;
      return (res as Response).status(429).json({
        error: "RATE_LIMITED",
        tenantId,
        route: params.routeTag,
        windowSeconds: params.windowSeconds,
        maxRequests: params.maxRequests,
        ts: new Date().toISOString(),
      });
    },
    store: new RedisStore({
      prefix: `${params.keyPrefix}:${params.routeTag}:`,
      sendCommand: (args: string[]) => params.redis.sendCommand(args),
    }),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.caller?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });
    }

    return limiter(req, res, next);
  };
}
