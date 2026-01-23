import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const envExample = resolve(root, 'packages', 'bickford', '.env.example');
const envFile = resolve(root, 'packages', 'bickford', '.env');

function ensureDir() {
  mkdirSync(resolve(root, 'packages', 'bickford'), { recursive: true });
}

function ensureEnvFile() {
  ensureDir();
  if (existsSync(envFile)) {
    console.log(`[setup] OK: ${envFile} already exists`);
    return;
  }

  if (existsSync(envExample)) {
    copyFileSync(envExample, envFile);
    console.log(`[setup] Created ${envFile} from .env.example`);
    return;
  }

  // Fallback minimal env (keeps chat runnable in demo mode).
  const minimal = [
    '# Minimal Bickford env (auto-generated)',
    'AUTH_MODE=none',
    'OPENAI_API_KEY=',
    'OPENAI_MODEL=gpt-4o-mini',
    'OPENAI_BASE_URL=https://api.openai.com/v1',
    'OPENAI_TIMEOUT_MS=15000',
    '',
  ].join('\n');
  writeFileSync(envFile, minimal, 'utf8');
  console.log(`[setup] Created minimal ${envFile}`);
}

function hydrateOpenAiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return false;
  }

  let contents = '';
  try {
    contents = readFileSync(envFile, 'utf8');
  } catch {
    return false;
  }

  if (contents.match(/^OPENAI_API_KEY=/m)) {
    contents = contents.replace(/^OPENAI_API_KEY=.*/m, `OPENAI_API_KEY=${apiKey}`);
  } else {
    contents = `${contents.trimEnd()}\nOPENAI_API_KEY=${apiKey}\n`;
  }

  writeFileSync(envFile, contents, 'utf8');
  console.log('[setup] OPENAI_API_KEY detected in environment and stored in .env');
  return true;
}

function printNextSteps() {
  let contents = '';
  try {
    contents = readFileSync(envFile, 'utf8');
  } catch {
    // ignore
  }

  const hasKey = /^\s*OPENAI_API_KEY\s*=\s*\S+/m.test(contents);

  console.log('[setup] Next steps:');
  console.log('  - Start stack: npm run dev:chat');
  console.log('  - Web UI: Ports tab → 5173 → Open in Browser');
  if (!hasKey) {
    console.log('  - To enable OpenAI: set OPENAI_API_KEY in packages/bickford/.env, then restart');
  }
}

ensureEnvFile();
hydrateOpenAiKey();
printNextSteps();
