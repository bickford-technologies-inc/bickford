// ops/requestId.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  const h = req.header("x-request-id") || req.header("X-Request-Id");
  req.requestId = h || crypto.randomBytes(12).toString("hex");
  next();
}
