-- TIMESTAMP: 2025-12-23T14:41:00-05:00

ALTER TABLE canon_ledger_events
  ADD COLUMN IF NOT EXISTS seq bigint,
  ADD COLUMN IF NOT EXISTS prev_hash text,
  ADD COLUMN IF NOT EXISTS event_hash text;

CREATE INDEX IF NOT EXISTS idx_canon_ledger_pointer_seq
  ON canon_ledger_events(pointer, seq);

CREATE INDEX IF NOT EXISTS idx_canon_ledger_event_hash
  ON canon_ledger_events(event_hash);
