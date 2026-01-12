import { spawn } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_PORT = Number(process.env.PORT || 3000);
const WEB_PORT = Number(process.env.WEB_PORT || 5173);
const API_BASE = process.env.BICKFORD_API_BASE_URL || `http://127.0.0.1:${API_PORT}`;
const WEB_BASE = process.env.WEB_UI_BASE_URL || `http://127.0.0.1:${WEB_PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForOk(url, { timeoutMs = 60_000, intervalMs = 500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return true;
    } catch {
      // ignore (expected during startup)
    }
    await sleep(intervalMs);
  }
  return false;
}

function run(cmd, args, { name, env } = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...(env || {}) },
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name || cmd}] exited with code ${code}`);
    }
  });
  return child;
}

function ensureEnvExample() {
  const envExample = resolve(process.cwd(), 'packages', 'bickford', '.env.example');
  const envFile = resolve(process.cwd(), 'packages', 'bickford', '.env');
  if (!existsSync(envFile) && existsSync(envExample)) {
    copyFileSync(envExample, envFile);
    console.log(`[dev:chat] created ${envFile} from .env.example (set OPENAI_API_KEY to enable LLM)`);
  }
}

async function main() {
  ensureEnvExample();

  console.log(`[dev:chat] starting API + web UI`);

  // Start API only if not already up
  let api = null;
  const alreadyApi = await waitForOk(`${API_BASE}/api/ready`, { timeoutMs: 1_000, intervalMs: 250 });
  if (alreadyApi) {
    console.log(`[dev:chat] API already running at ${API_BASE}`);
  } else {
    api = run('npm', ['run', 'dev:api'], { name: 'dev:api' });
  }

  // Start web UI only if not already up
  let web = null;
  const alreadyWeb = await waitForOk(`${WEB_BASE}/`, { timeoutMs: 1_000, intervalMs: 250 });
  if (alreadyWeb) {
    console.log(`[dev:chat] Web UI already running at ${WEB_BASE}`);
  } else {
    web = run('npm', ['run', 'dev:web'], { name: 'dev:web', env: { WEB_PORT: String(WEB_PORT) } });
  }

  const apiReady = await waitForOk(`${API_BASE}/api/ready`, { timeoutMs: 90_000 });
  if (!apiReady) {
    console.error(`[dev:chat] API not ready at ${API_BASE}/api/ready`);
    api?.kill('SIGTERM');
    web?.kill('SIGTERM');
    process.exit(1);
  }

  console.log(`[dev:chat] API: ${API_BASE}`);
  console.log(`[dev:chat] Web (local): ${WEB_BASE}`);
  console.log(`[dev:chat] Codespaces: use the forwarded port ${WEB_PORT} URL (Ports tab → ${WEB_PORT} → Open in Browser)`);

  // Run chat check
  const test = spawn('npm', ['run', 'test:chat'], { stdio: 'inherit' });
  const code = await new Promise((resolveCode) => test.on('exit', resolveCode));
  if (code !== 0) {
    api?.kill('SIGTERM');
    web?.kill('SIGTERM');
    process.exit(code || 1);
  }

  // Optionally open the browser if available.
  const browser = process.env.BROWSER;
  if (browser) {
    try {
      spawn(browser, [WEB_BASE], { stdio: 'ignore', detached: true });
      console.log(`[dev:chat] opened: ${WEB_BASE}`);
    } catch {
      // ignore
    }
  }

  console.log('[dev:chat] chat check passed; leaving servers running');
}

main().catch((err) => {
  console.error('[dev:chat] FAIL');
  console.error(err?.stack || String(err));
  process.exit(1);
});
