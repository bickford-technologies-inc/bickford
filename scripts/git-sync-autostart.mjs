import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function repoRoot() {
  // Assumes this script lives in <root>/scripts/
  return path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
}

function envFlag(name, defaultValue = true) {
  const v = String(process.env[name] ?? '').trim().toLowerCase();
  if (!v) return defaultValue;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  return defaultValue;
}

function ensureDir(p) {
  try {
    fs.mkdirSync(p, { recursive: true });
  } catch {
    // ignore
  }
}

function main() {
  // Default: ON (because you asked for fully automated)
  const enabled = envFlag('GIT_SYNC_AUTOSTART', true);
  if (!enabled) {
    console.log('[git-sync] autostart disabled (GIT_SYNC_AUTOSTART=0)');
    return;
  }

  const root = repoRoot();
  const logDir = path.join(root, '.data');
  ensureDir(logDir);

  const logPath = path.join(logDir, 'git-sync-daemon.log');
  const out = fs.openSync(logPath, 'a');

  const child = spawn('node', [path.join(root, 'scripts', 'git-sync-daemon.mjs')], {
    cwd: root,
    detached: true,
    stdio: ['ignore', out, out],
    env: process.env,
  });

  child.unref();
  console.log(`[git-sync] autostarted (pid=${child.pid}, log=${logPath})`);
}

main();
