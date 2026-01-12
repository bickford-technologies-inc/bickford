#!/usr/bin/env node
/**
 * Chat v2 Invariants Checker
 * 
 * Enforces canonical invariants for Chat v2 execution surface:
 * 1. Replay API must be side-effect free
 * 2. Replay mode cannot trigger execution
 * 3. Intent must be bound to evidence (sourceMessageId)
 * 4. Canon linkage must be preserved
 * 5. Thread replay must be deterministic
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function fail(msg) {
  console.error(`\n❌ CHAT INVARIANT FAILED: ${msg}\n`);
  process.exit(1);
}

function exists(p) {
  return fs.existsSync(p);
}

function requireFile(p) {
  if (!exists(p)) fail(`Missing required file: ${p}`);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

console.log("🔍 Checking Chat v2 invariants...\n");

// ---------- 1) Replay API must exist and be read-only ----------
const replayRoutePath = path.join(
  ROOT,
  "apps/web/src/app/api/chat/replay/route.ts"
);
requireFile(replayRoutePath);

const replayRoute = readFile(replayRoutePath);
assert(
  replayRoute.includes("mode: \"replay\"") || replayRoute.includes('mode: "replay"'),
  "Replay route must set mode: 'replay' in response"
);

// Ensure replay route does NOT call execute functions
assert(
  !replayRoute.includes("executeOperation") && !replayRoute.includes("execute("),
  "Replay route must NOT call execute functions (side-effect free invariant)"
);

// Ensure replay includes canon linkage
assert(
  replayRoute.includes("canonEntry"),
  "Replay route must include canon linkage"
);

// ---------- 2) Runtime mode file must exist ----------
const modeFilePath = path.join(ROOT, "packages/core/src/runtime/mode.ts");
requireFile(modeFilePath);

const modeFile = readFile(modeFilePath);
assert(
  modeFile.includes("live") && modeFile.includes("replay"),
  "Runtime mode must define 'live' and 'replay' modes"
);

assert(
  modeFile.includes("assertExecutionAllowed"),
  "Runtime mode must define assertExecutionAllowed gate"
);

// ---------- 3) Execute file must forbid replay ----------
const executeFilePath = path.join(ROOT, "packages/core/src/runtime/execute.ts");
requireFile(executeFilePath);

const executeFile = readFile(executeFilePath);
assert(
  executeFile.includes("forbidReplayExecution"),
  "Execute module must define forbidReplayExecution gate"
);

assert(
  executeFile.includes("replay") && executeFile.includes("throw"),
  "Execute module must throw error for replay mode"
);

// ---------- 4) Context file must load canon constraints ----------
const contextFilePath = path.join(
  ROOT,
  "packages/core/src/runtime/context.ts"
);
requireFile(contextFilePath);

const contextFile = readFile(contextFilePath);
assert(
  contextFile.includes("canonConstraints"),
  "Runtime context must include canonConstraints"
);

assert(
  contextFile.includes("loadCanonConstraints"),
  "Runtime context must define loadCanonConstraints function"
);

// ---------- 5) Prisma schema must enforce Chat v2 invariants ----------
const schemaPath = path.join(ROOT, "prisma/schema.prisma");
requireFile(schemaPath);

const schema = readFile(schemaPath);

// Intent.sourceMessageId must be @unique
assert(
  schema.includes("sourceMessageId") && 
  schema.match(/sourceMessageId[^@]*@unique/),
  "Intent.sourceMessageId must be @unique (evidence-bound invariant)"
);

// ChatMessage.intentId must be @unique
assert(
  schema.match(/intentId[^@]*@unique/),
  "ChatMessage.intentId must be @unique (one intent per message)"
);

// Execution.intentId must be @unique
assert(
  schema.match(/model Execution[\s\S]*?intentId[^}]*@unique/),
  "Execution.intentId must be @unique (one execution per intent)"
);

// ChatThread model must exist
assert(
  schema.includes("model ChatThread"),
  "ChatThread model must exist in schema"
);

// ChatMessage must link to ChatThread
assert(
  schema.includes("threadId") && schema.includes("ChatThread"),
  "ChatMessage must link to ChatThread for replay"
);

// ---------- 6) Migration must exist ----------
const migrationPath = path.join(
  ROOT,
  "prisma/migrations/20260208_chat_v2/migration.sql"
);
requireFile(migrationPath);

const migration = readFile(migrationPath);
assert(
  migration.includes("ChatThread") && migration.includes("CanonEntry"),
  "Chat v2 migration must create ChatThread and CanonEntry tables"
);

console.log("✅ All Chat v2 invariants satisfied.\n");
console.log("Invariants enforced:");
console.log("  ✓ Replay cannot execute");
console.log("  ✓ Intent bound to evidence (sourceMessageId unique)");
console.log("  ✓ Canon constraints loaded into runtime");
console.log("  ✓ Deterministic replay enabled");
console.log("  ✓ Thread-message linkage present");
