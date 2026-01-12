// storage.redis.ts
// TIMESTAMP: 2025-12-23T14:16:00-05:00
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL!;
const PREFIX = process.env.REDIS_PREFIX || "bickford:canon";

export type LedgerEvent = any; // reuse your LedgerEvent type in server.ts if you want

export function redisClient() {
  const client = createClient({ url: REDIS_URL });
  client.on("error", (err) => console.error("[REDIS]", err));
  return client;
}

const k = (tenantId: string, parts: string[]) => `${PREFIX}:${tenantId}:${parts.join(":")}`;

export class RedisCanonStore {
  constructor(private client: ReturnType<typeof redisClient>) {}

  // ---------- hash-chain ledger head (for tamper-evident chain) ----------
  async getLedgerHead(tenantId: string, pointer: string) {
    const headHash = await this.client.get(k(tenantId, ["ledgerhead", pointer, "hash"]));
    const headSeq = await this.client.get(k(tenantId, ["ledgerhead", pointer, "seq"]));
    return {
      headHash: headHash ?? null,
      headSeq: headSeq ? Number(headSeq) : null,
    };
  }

  async setLedgerHead(tenantId: string, pointer: string, headHash: string, headSeq: number, ttlSeconds = 60 * 60 * 24 * 30) {
    await this.client.set(k(tenantId, ["ledgerhead", pointer, "hash"]), headHash, { EX: ttlSeconds });
    await this.client.set(k(tenantId, ["ledgerhead", pointer, "seq"]), String(headSeq), { EX: ttlSeconds });
  }

  // ---------- idempotency: decide/promote/non-interference ----------
  async getIdem(kind: "decide" | "promote" | "ni", tenantId: string, stableKey: string) {
    return await this.client.get(k(tenantId, ["idem", kind, stableKey]));
  }

  async setIdem(
    kind: "decide" | "promote" | "ni",
    tenantId: string,
    stableKey: string,
    valueJson: string,
    ttlSeconds = 60 * 60 * 24 * 7 // 7 days
  ) {
    await this.client.set(k(tenantId, ["idem", kind, stableKey]), valueJson, { EX: ttlSeconds });
  }

  // ---------- denial index by id (decisionId/promotionId/checkId) ----------
  async setDenial(tenantId: string, id: string, entryJson: string, ttlSeconds = 60 * 60 * 24 * 30) {
    await this.client.set(k(tenantId, ["deny", id]), entryJson, { EX: ttlSeconds });
  }

  async getDenial(tenantId: string, id: string) {
    return await this.client.get(k(tenantId, ["deny", id]));
  }

  // ---------- ledger pointer -> append events ----------
  async appendLedger(tenantId: string, pointer: string, evtJson: string, ttlSeconds = 60 * 60 * 24 * 30) {
    const listKey = k(tenantId, ["ledger", pointer]);
    await this.client.rPush(listKey, evtJson);
    await this.client.expire(listKey, ttlSeconds);
  }

  async getLedger(tenantId: string, pointer: string, max = 500) {
    const listKey = k(tenantId, ["ledger", pointer]);
    const len = await this.client.lLen(listKey);
    const start = Math.max(0, len - max);
    return await this.client.lRange(listKey, start, -1);
  }
}
