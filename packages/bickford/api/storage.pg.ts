// LedgerEventRow and LedgerEvent types for recent ledger events
export type LedgerEventRow = {
  pointer: string;
  tenant_id: string;
  ts: string;
  event_type: string;
  action_id: string | null;
  decision_id: string | null;
  stable_key: string | null;
  prev_hash: string | null;
  event_hash: string | null;
  payload: any | null;
};

export type LedgerEvent = {
  pointer: string;
  tenantId: string;
  ts: string;
  type: string;
  actionId?: string;
  decisionId?: string;
  stableKey?: string;
  prevHash?: string | null;
  hash?: string | null;
  payload?: any;
};
// storage.pg.ts
// TIMESTAMP: 2025-12-23T14:28:00-05:00
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL!;
const PG_SSL = (process.env.PG_SSL || "false").toLowerCase() === "true";

export function pgPool() {
  return new Pool({
    connectionString: DATABASE_URL,
    ssl: PG_SSL ? { rejectUnauthorized: false } : undefined,
  });
}

/**
 * Postgres canonical archive store.
 *
 * Recommended use:
 * - Write ledger + denials to PG (durable).
 * - Keep idempotency in Redis for speed (but PG method included for completeness).
 */
export class PostgresCanonStore {

    async getRecentLedgerEvents(tenantId: string, limit: number): Promise<LedgerEvent[]> {
      const n = Math.max(1, Math.min(limit, 200));
      const r = await this.pool.query<LedgerEventRow>(
        `
        SELECT
          pointer,
          tenant_id,
          ts,
          event_type,
          action_id,
          decision_id,
          stable_key,
          prev_hash,
          event_hash,
          payload
        FROM canon_ledger_events
        WHERE tenant_id = $1
        ORDER BY ts DESC
        LIMIT $2
        `,
        [tenantId, n]
      );
      return r.rows.map((row) => ({
        pointer: row.pointer,
        tenantId: row.tenant_id,
        ts: row.ts,
        type: row.event_type,
        actionId: row.action_id ?? undefined,
        decisionId: row.decision_id ?? undefined,
        stableKey: row.stable_key ?? undefined,
        prevHash: row.prev_hash ?? undefined,
        hash: row.event_hash ?? undefined,
        payload: row.payload ?? undefined,
      }));
    }
  constructor(private pool: Pool) {}

  // ---------- Optional idempotency (PG) ----------
  // If you want PG idempotency, create a table canon_idempotency (not required).
  async getIdem(_kind: "decide" | "promote" | "ni", _stableKey: string) {
    // intentionally not implemented by default: use Redis for idempotency
    return null as string | null;
  }

  async setIdem(_kind: "decide" | "promote" | "ni", _stableKey: string, _valueJson: string) {
    // intentionally not implemented by default
  }

  // ---------- denial index ----------
  async setDenial(params: {
    id: string;
    ts: string;
    kind: "DECIDE" | "PROMOTE" | "NON_INTERFERENCE";
    actionId: string;
    stableKey: string;
    denialTrace: unknown;
  }) {
    await this.pool.query(
      `
      INSERT INTO canon_denials (id, ts, kind, action_id, stable_key, denial_trace)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id)
      DO UPDATE SET
        ts = EXCLUDED.ts,
        kind = EXCLUDED.kind,
        action_id = EXCLUDED.action_id,
        stable_key = EXCLUDED.stable_key,
        denial_trace = EXCLUDED.denial_trace
      `,
      [
        params.id,
        params.ts,
        params.kind,
        params.actionId,
        params.stableKey,
        JSON.stringify(params.denialTrace),
      ]
    );
  }

  async getDenial(id: string) {
    const r = await this.pool.query(
      `SELECT id, ts, kind, action_id, stable_key, denial_trace
       FROM canon_denials
       WHERE id = $1`,
      [id]
    );
    if (r.rowCount === 0) return null;
    const row = r.rows[0];
    return {
      id: row.id,
      ts: row.ts,
      kind: row.kind,
      actionId: row.action_id,
      stableKey: row.stable_key,
      denialTrace: row.denial_trace,
    };
  }

  // ---------- ledger events ----------
  async appendLedger(params: {
    ts: string;
    tenantId: string;
    actionId: string;
    stableKey: string;
    pointer: string;
    eventType: string;
    decisionId?: string | null;
    payload: unknown;
  }) {
    await this.pool.query(
      `
      INSERT INTO canon_ledger_events
        (ts, tenant_id, action_id, stable_key, pointer, event_type, decision_id, payload)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        params.ts,
        params.tenantId,
        params.actionId,
        params.stableKey,
        params.pointer,
        params.eventType,
        params.decisionId ?? null,
        JSON.stringify(params.payload),
      ]
    );
  }

  async getLedgerTail(pointer: string): Promise<{ seq: number; eventHash: string } | null> {
    const r = await this.pool.query(
      `
      SELECT seq, event_hash
      FROM canon_ledger_events
      WHERE pointer = $1 AND seq IS NOT NULL AND event_hash IS NOT NULL
      ORDER BY seq DESC
      LIMIT 1
      `,
      [pointer]
    );
    if (r.rowCount === 0) return null;
    return { seq: Number(r.rows[0].seq), eventHash: String(r.rows[0].event_hash) };
  }

  async appendLedgerHashed(params: {
    ts: string;
    tenantId: string;
    actionId: string;
    stableKey: string;
    pointer: string;
    eventType: string;
    decisionId?: string | null;
    payload: unknown;
    seq: number;
    prevHash: string | null;
    eventHash: string;
  }) {
    await this.pool.query(
      `
      INSERT INTO canon_ledger_events
        (ts, tenant_id, action_id, stable_key, pointer, event_type, decision_id, payload, seq, prev_hash, event_hash)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        params.ts,
        params.tenantId,
        params.actionId,
        params.stableKey,
        params.pointer,
        params.eventType,
        params.decisionId ?? null,
        JSON.stringify(params.payload),
        params.seq,
        params.prevHash,
        params.eventHash,
      ]
    );
  }

  async getLedger(pointer: string, max = 500) {
    const r = await this.pool.query(
      `
      SELECT ts, tenant_id, action_id, stable_key, pointer, event_type, decision_id, payload
      FROM canon_ledger_events
      WHERE pointer = $1
      ORDER BY id ASC
      LIMIT $2
      `,
      [pointer, max]
    );
    return r.rows.map((row) => ({
      ts: row.ts,
      tenantId: row.tenant_id,
      actionId: row.action_id,
      stableKey: row.stable_key,
      pointer: row.pointer,
      type: row.event_type,
      decisionId: row.decision_id,
      payload: row.payload,
    }));
  }
}
