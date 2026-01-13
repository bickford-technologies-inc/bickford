// security/ratelimit.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import type { Request, Response, NextFunction } from "express";

export type RedisLike = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
};

export function rateLimitRedis(params: {
  redis: RedisLike;
  keyPrefix: string;             // e.g. "bickford:rl"
  windowSeconds: number;         // e.g. 60
  maxRequests: number;           // e.g. 600
  routeTag: string;              // e.g. "decide"
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.caller?.tenantId;
    if (!tenantId) return res.status(401).json({ error: "UNAUTHENTICATED", ts: new Date().toISOString() });

    const key = `${params.keyPrefix}:${tenantId}:${params.routeTag}:${Math.floor(Date.now() / 1000 / params.windowSeconds)}`;

    try {
      const n = await params.redis.incr(key);
      if (n === 1) await params.redis.expire(key, params.windowSeconds);

      if (n > params.maxRequests) {
        return res.status(429).json({
          error: "RATE_LIMITED",
          tenantId,
          route: params.routeTag,
          windowSeconds: params.windowSeconds,
          maxRequests: params.maxRequests,
          ts: new Date().toISOString(),
        });
      }

      return next();
    } catch (e: any) {
      // Fail closed or open? For authority surfaces: fail closed (deny).
      return res.status(503).json({
        error: "RATE_LIMIT_BACKEND_UNAVAILABLE",
        message: e?.message,
        ts: new Date().toISOString(),
      });
    }
  };
}
