#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const API_URL = process.env.API_URL || "http://localhost:3000";
const READY_URL = `${API_URL}/api/ready`;
const CHAT_URL = `${API_URL}/api/filing/chat`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length) : trimmed;
    const eq = normalized.indexOf("=");
    if (eq <= 0) continue;
    const key = normalized.slice(0, eq).trim();
    let value = normalized.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function fetchJson(url, opts) {
  const resp = await fetch(url, opts);
  const txt = await resp.text();
  let json;
  try {
    json = JSON.parse(txt);
  } catch {
    throw new Error(`Non-JSON response from ${url}: ${txt.slice(0, 200)}`);
  }
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} from ${url}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json;
}

async function waitForReady(timeoutMs = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const resp = await fetch(READY_URL);
      if (resp.ok) return;
    } catch {
      // ignore
    }
    await sleep(250);
  }
  throw new Error(`API not ready at ${READY_URL} within ${timeoutMs}ms`);
}

function extractObservation(events) {
  return (events || []).find((e) => e && e.kind === "OBSERVATION");
}

async function main() {
  const envPath = path.resolve(process.cwd(), ".env");
  const env = parseDotEnvFile(envPath);
  const hasKey = Boolean((env.OPENAI_API_KEY || "").trim());
  const hasModel = Boolean((env.OPENAI_MODEL || "").trim());

  if (!hasKey || !hasModel) {
    console.error("FAIL: Missing OpenAI configuration in repo-root .env (no secrets printed).\n");
    console.error(`- .env present: ${fs.existsSync(envPath)}`);
    console.error(`- OPENAI_API_KEY set: ${hasKey}`);
    console.error(`- OPENAI_MODEL set: ${hasModel}`);
    console.error("\nFix:");
    console.error("- Edit .env and set OPENAI_API_KEY=... and OPENAI_MODEL=...\n");
    process.exit(2);
  }

  const child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["-w", "packages/session-completion-runtime", "run", "start", "--silent"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    }
  );

  let stderrBuf = "";
  child.stderr.on("data", (d) => {
    stderrBuf += String(d);
  });

  try {
    await waitForReady();

    const payload = await fetchJson(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "bickford ask what is 2+2" }),
    });

    const obs = extractObservation(payload?.events);
    const source = obs?.payload?.source;

    if (source === "local") {
      console.error("FAIL: bickford ask used local fallback (OpenAI not configured or call failed).\n");
      const reason = obs?.payload?.openaiError;
      if (reason) {
        console.error("OpenAI error (from API):");
        console.error(String(reason).slice(0, 500) + "\n");
      }
      console.error("Hints:");
      console.error("- Set OPENAI_API_KEY and OPENAI_MODEL in repo-root .env");
      console.error("- If the key/model are set, the error above usually indicates an invalid key, missing model access, networking, or a bad OPENAI_BASE_URL");
      console.error("- Re-run: npm run verify:chatgpt");
      process.exitCode = 2;
      return;
    }

    console.log("PASS: bickford ask executed via OpenAI (not local fallback).\n");
    const answer = obs?.payload?.answer || obs?.payload?.text;
    if (answer) {
      console.log("Sample answer:");
      console.log(String(answer).slice(0, 240));
    }
  } finally {
    child.kill("SIGTERM");
    await sleep(300);
    if (!child.killed) child.kill("SIGKILL");

    // If the API failed to boot, show a small snippet (no secrets).
    if (stderrBuf.trim()) {
      const snippet = stderrBuf.trim().split(/\r?\n/).slice(-10).join("\n");
      console.error("\n(API stderr tail)\n" + snippet);
    }
  }
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
