import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type CanonicalMessage = {
  id: string;
  agent: "user" | "ai" | "system" | string;
  timestamp: string;
  text: string;
  intentRef?: string;
};

export type LedgerEntry = {
  id: string;
  timestamp: string;
  intent?: Record<string, unknown>;
  decision?: Record<string, unknown>;
  rationale?: string;
  hash?: string;
  [key: string]: unknown;
};

export type KnowledgeSchema = {
  state: Record<string, unknown>;
  last_update: string | null;
  ledger_refs: string[];
};

export type AgentsRegistry = Record<string, unknown>[];

export type InterchangeEnvelope = {
  agentId: string;
  direction: "import" | "export";
  receivedAt?: string | null;
  sentAt?: string | null;
  payload: Record<string, unknown>[];
};

const DATALAKE_DIR = path.resolve(process.cwd(), "datalake");
const LEDGER_FILE = path.join(DATALAKE_DIR, "ledger.jsonl");
const MESSAGES_FILE = path.join(DATALAKE_DIR, "messages.jsonl");
const KNOWLEDGE_SCHEMA_FILE = path.join(DATALAKE_DIR, "knowledge-schema.json");
const AGENTS_FILE = path.join(DATALAKE_DIR, "agents.json");
const INTERCHANGE_DIR = path.join(DATALAKE_DIR, "interchange");

function ensureDir(target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function appendJsonl(target: string, payload: Record<string, unknown>) {
  ensureDir(path.dirname(target));
  fs.appendFileSync(target, `${JSON.stringify(payload)}\n`);
}

function hashEntry(payload: Record<string, unknown>) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function appendMessage(entry: CanonicalMessage): CanonicalMessage {
  appendJsonl(MESSAGES_FILE, entry);
  return entry;
}

export function appendLedgerEntry(entry: LedgerEntry): LedgerEntry {
  const { hash, ...rest } = entry;
  const computedHash = hash ?? hashEntry(rest);
  const fullEntry = { ...rest, hash: computedHash };
  appendJsonl(LEDGER_FILE, fullEntry);
  return fullEntry;
}

export function readKnowledgeSchema(): KnowledgeSchema {
  const raw = fs.readFileSync(KNOWLEDGE_SCHEMA_FILE, "utf8");
  return JSON.parse(raw) as KnowledgeSchema;
}

export function writeKnowledgeSchema(schema: KnowledgeSchema): KnowledgeSchema {
  ensureDir(DATALAKE_DIR);
  const updated = {
    ...schema,
    last_update: schema.last_update ?? new Date().toISOString(),
  };
  fs.writeFileSync(KNOWLEDGE_SCHEMA_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export function readAgentsRegistry(): AgentsRegistry {
  const raw = fs.readFileSync(AGENTS_FILE, "utf8");
  return JSON.parse(raw) as AgentsRegistry;
}

export function writeAgentsRegistry(registry: AgentsRegistry): AgentsRegistry {
  ensureDir(DATALAKE_DIR);
  fs.writeFileSync(AGENTS_FILE, JSON.stringify(registry, null, 2));
  return registry;
}

export function writeInterchangeEnvelope(
  agentId: string,
  envelope: InterchangeEnvelope,
  direction: "import" | "export",
): InterchangeEnvelope {
  ensureDir(INTERCHANGE_DIR);
  const fileName = `agent-${agentId}-${direction}.json`;
  const payload = {
    ...envelope,
    agentId,
    direction,
  };
  fs.writeFileSync(
    path.join(INTERCHANGE_DIR, fileName),
    JSON.stringify(payload, null, 2),
  );
  return payload;
}
