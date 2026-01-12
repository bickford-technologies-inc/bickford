import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const intervalMs = Math.max(5_000, Number(process.env.GIT_SYNC_INTERVAL_MS || 60_000));
const jitterMs = Math.max(0, Number(process.env.GIT_SYNC_JITTER_MS || 2_000));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function repoRoot() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return String(r.stdout || '').trim();
}

function acquireLock(lockPath) {
  try {
    fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    return false;
  }
}

function releaseLock(lockPath) {
  try {
    fs.unlinkSync(lockPath);
  } catch {
    // ignore
  }
}

async function main() {
  const root = repoRoot();
  if (!root) {
    console.error('[git-sync] Not a git repository.');
    process.exit(2);
  }

  const lockPath = path.join(root, '.git', 'git-sync.lock');
  if (!acquireLock(lockPath)) {
    console.error(`[git-sync] Another sync loop appears to be running (lock: ${lockPath}).`);
    process.exit(2);
  }

  console.log(`[git-sync] Daemon running (interval=${intervalMs}ms).`);
  console.log('[git-sync] Stop with Ctrl+C.');

  const cleanup = () => {
    releaseLock(lockPath);
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  while (true) {
    const started = Date.now();
    const r = spawnSync('node', [path.join(root, 'scripts', 'git-sync.mjs')], { stdio: 'inherit' });

    const elapsed = Date.now() - started;
    const jitter = Math.floor(Math.random() * jitterMs);
    const wait = Math.max(0, intervalMs - elapsed) + jitter;
    await sleep(wait);
  }
}

main().catch((e) => {
  console.error('[git-sync] Daemon failed');
  console.error(e?.message || e);
  process.exit(1);
});
