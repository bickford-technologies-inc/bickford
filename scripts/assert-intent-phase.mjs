#!/usr/bin/env node
// scripts/assert-intent-phase.mjs
// Enforces that the current phase of execution matches declared intent and canonical invariants.
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Canonical intent file (could be set by automation or CI)
const INTENT_PATH = join(process.cwd(), "intent.json");

function fail(msg) {
  console.error(`[assert-intent-phase] ERROR: ${msg}`);
  process.exit(1);
}

if (!existsSync(INTENT_PATH)) {
  fail("intent.json not found. All execution must be intent-driven.");
}

let intent;
try {
  intent = JSON.parse(readFileSync(INTENT_PATH, "utf-8"));
} catch (e) {
  fail("intent.json is not valid JSON.");
}

if (!intent.phase || typeof intent.phase !== "string") {
  fail('intent.json missing required "phase" field.');
}

// Example: enforce only allowed phases
const allowedPhases = ["plan", "execute", "review", "deploy", "complete"];
if (!allowedPhases.includes(intent.phase)) {
  fail(
    `intent.phase "${intent.phase}" is not allowed. Allowed: ${allowedPhases.join(", ")}`,
  );
}

console.log(`[assert-intent-phase] Phase: ${intent.phase} (OK)`);
process.exit(0);
