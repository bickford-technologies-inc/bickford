-- TIMESTAMP: 2025-12-23T14:55:00-05:00

CREATE TABLE IF NOT EXISTS canon_ledger_anchors (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL,
  pointer text NOT NULL,
  head_seq bigint NOT NULL,
  head_hash text NOT NULL,
  anchor_type text NOT NULL,       -- "s3"
  anchor_uri text NOT NULL,        -- s3://bucket/key
  anchor_etag text,
  anchor_version_id text,
  signature text,
  payload jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_canon_ledger_anchors_pointer_ts
  ON canon_ledger_anchors(pointer, ts DESC);
