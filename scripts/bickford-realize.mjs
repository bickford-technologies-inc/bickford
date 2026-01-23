#!/usr/bin/env node
import fs from "fs";
import path from "path";

const DEFAULT_INTENT = "intent.json";
const DEFAULT_OUT_DIR = ".bickford";
const DEFAULT_REALIZED = "REALIZED.json";

const args = process.argv.slice(2);
const command = args[0];

const flags = new Map();
for (let i = 1; i < args.length; i += 1) {
  const arg = args[i];
  if (!arg.startsWith("--")) continue;
  const [rawKey, rawValue] = arg.replace(/^--/, "").split("=");
  const key = rawKey.trim();
  if (rawValue !== undefined) {
    flags.set(key, rawValue);
    continue;
  }
  const next = args[i + 1];
  if (next && !next.startsWith("--")) {
    flags.set(key, next);
    i += 1;
    continue;
  }
  flags.set(key, true);
}

function resolvePath(value, fallback) {
  if (!value || value === true) return path.resolve(fallback);
  return path.resolve(String(value));
}

function readIntent(intentPath) {
  if (!fs.existsSync(intentPath)) {
    throw new Error(`Intent file not found: ${intentPath}`);
  }
  const intent = JSON.parse(fs.readFileSync(intentPath, "utf8"));
  validateIntent(intent, intentPath);
  return intent;
}

function writeRealized(outDir, intent) {
  fs.mkdirSync(outDir, { recursive: true });
  const payload = {
    intent,
    realized_at: new Date().toISOString(),
    build: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  };
  const realizedPath = path.join(outDir, DEFAULT_REALIZED);
  fs.writeFileSync(realizedPath, JSON.stringify(payload, null, 2));
  return realizedPath;
}

function showStatus(outDir) {
  const realizedPath = path.join(outDir, DEFAULT_REALIZED);
  if (!fs.existsSync(realizedPath)) {
    console.log("No realization record found.");
    process.exit(1);
  }
  const payload = JSON.parse(fs.readFileSync(realizedPath, "utf8"));
  console.log(JSON.stringify(payload, null, 2));
}

function printHelp() {
  console.log(`Usage:
  bickford realize [--intent=path] [--out=dir]
  bickford status [--out=dir]
  bickford help

Defaults:
  --intent=${DEFAULT_INTENT}
  --out=${DEFAULT_OUT_DIR}
`);
}

try {
  if (!command || ["help", "--help", "-h"].includes(command)) {
    printHelp();
    process.exit(0);
  }

  const intentPath = resolvePath(flags.get("intent"), DEFAULT_INTENT);
  const outDir = resolvePath(flags.get("out"), DEFAULT_OUT_DIR);

  switch (command) {
    case "realize": {
      const intent = readIntent(intentPath);
      const realizedPath = writeRealized(outDir, intent);
      console.log(`Realization recorded: ${realizedPath}`);
      break;
    }
    case "status": {
      showStatus(outDir);
      break;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function validateIntent(intent, intentPath) {
  if (!intent || typeof intent !== "object") {
    throw new Error(`Invalid intent payload in ${intentPath}`);
  }
  if (typeof intent.id !== "string" || intent.id.trim() === "") {
    throw new Error(`Intent id is required in ${intentPath}`);
  }
  if (typeof intent.action !== "string" || intent.action.trim() === "") {
    throw new Error(`Intent action is required in ${intentPath}`);
  }
}
