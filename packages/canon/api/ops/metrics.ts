// ops/metrics.ts
// TIMESTAMP: 2025-12-23T15:45:00-05:00
import client from "prom-client";
import type { Request, Response, NextFunction } from "express";

client.collectDefaultMetrics();

export const httpLatency = new client.Histogram({
  name: "bickford_http_latency_ms",
  help: "HTTP latency in ms",
  labelNames: ["route", "method", "status"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
});

export const decisionCount = new client.Counter({
  name: "bickford_decisions_total",
  help: "Total decisions by route and outcome",
  labelNames: ["route", "outcome"],
});

export const idempotencyHits = new client.Counter({
  name: "bickford_idempotency_hits_total",
  help: "Total idempotency cache hits",
  labelNames: ["route"],
});

export function metricsMiddleware(routeTag: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      httpLatency.labels(routeTag, req.method, String(res.statusCode)).observe(ms);
    });
    next();
  };
}

export async function metricsHandler(req: Request, res: Response) {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
}
