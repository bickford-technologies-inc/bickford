-- TIMESTAMP: 2025-12-23T14:28:00-05:00

CREATE TABLE IF NOT EXISTS canon_ledger_events (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL,
  tenant_id text NOT NULL,
  action_id text NOT NULL,
  stable_key text NOT NULL,
  pointer text NOT NULL,
  event_type text NOT NULL,
  decision_id text,
  payload jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_canon_ledger_pointer ON canon_ledger_events(pointer);
CREATE INDEX IF NOT EXISTS idx_canon_ledger_decision_id ON canon_ledger_events(decision_id);
CREATE INDEX IF NOT EXISTS idx_canon_ledger_stable_key ON canon_ledger_events(stable_key);
CREATE INDEX IF NOT EXISTS idx_canon_ledger_ts ON canon_ledger_events(ts);

CREATE TABLE IF NOT EXISTS canon_denials (
  id text PRIMARY KEY,                 -- decisionId/promotionId/checkId
  ts timestamptz NOT NULL,
  kind text NOT NULL,                  -- DECIDE | PROMOTE | NON_INTERFERENCE
  action_id text NOT NULL,
  stable_key text NOT NULL,
  denial_trace jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_canon_denials_ts ON canon_denials(ts);
CREATE INDEX IF NOT EXISTS idx_canon_denials_kind ON canon_denials(kind);
CREATE INDEX IF NOT EXISTS idx_canon_denials_stable_key ON canon_denials(stable_key);
