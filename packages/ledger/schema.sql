CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  intent_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  authority TEXT NOT NULL,
  hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_intent
ON ledger(intent_id);

CREATE INDEX IF NOT EXISTS idx_ledger_created
ON ledger(created_at);
