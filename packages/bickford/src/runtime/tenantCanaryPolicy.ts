import fs from "fs";
import crypto from "crypto";
import { resolveRegion } from "./tenantRegionPolicy";

type Weights = Record<string, number>;

const policies = JSON.parse(
  fs.readFileSync("infra/routing/canary.json", "utf8")
).tenants as Record<string, { weights: Weights }>;

export function pickRegion(tenantId: string, seed: string): string {
  const p = policies[tenantId];
  if (!p) throw new Error(`No canary policy for ${tenantId}`);

  const entries = Object.entries(p.weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total !== 100) {
    throw new Error(`Weights must sum to 100 for ${tenantId}`);
  }

  // deterministic hash → 0–99
  const h = crypto.createHash("sha256").update(seed).digest()[0];

  let acc = 0;
  for (const [region, weight] of entries) {
    acc += weight;
    if (h % 100 < acc) {
      return resolveRegion(tenantId, region);
    }
  }

  throw new Error("No region selected");
}
