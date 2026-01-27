// Bun-native, dual-purpose ledger append (compliance + intelligence)
import { Database } from "bun:sqlite";
import { createHash } from "crypto";

const db = new Database("/workspaces/bickford/execution-ledger.db");

db.run(`CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  metadata TEXT,
  timestamp TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  current_hash TEXT NOT NULL
)`);

export async function appendToLedger(entry: {
  eventType: string;
  payload: any;
  metadata?: any;
  timestamp: string;
}) {
  // Get previous hash
  const last = db
    .query("SELECT current_hash FROM ledger ORDER BY id DESC LIMIT 1")
    .get();
  const previousHash =
    (last && (last as { current_hash: string }).current_hash) || "0".repeat(64);

  // Compute current hash
  const hashInput = previousHash + JSON.stringify(entry);
  const currentHash = createHash("sha256").update(hashInput).digest("hex");

  db.run(
    `INSERT INTO ledger (event_type, payload, metadata, timestamp, previous_hash, current_hash) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.eventType,
      JSON.stringify(entry.payload),
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.timestamp,
      String(previousHash),
      String(currentHash),
    ],
  );
}
