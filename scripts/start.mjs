import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const envFile = resolve(root, 'packages', 'bickford', '.env');

function ensureEnv() {
  spawnSync('node', ['scripts/setup.mjs'], { stdio: 'inherit', shell: process.platform === 'win32' });

  if (!process.env.OPENAI_API_KEY) {
    return;
  }

  if (!existsSync(envFile)) {
    return;
  }

  let contents = readFileSync(envFile, 'utf8');
  if (contents.match(/^OPENAI_API_KEY=/m)) {
    contents = contents.replace(/^OPENAI_API_KEY=.*/m, `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`);
  } else {
    contents = `${contents.trimEnd()}\nOPENAI_API_KEY=${process.env.OPENAI_API_KEY}\n`;
  }
  writeFileSync(envFile, contents, 'utf8');
  console.log('[start] OPENAI_API_KEY detected in environment and stored in .env');
}

function ensureDependencies() {
  if (existsSync(resolve(root, 'node_modules'))) {
    return;
  }

  console.log('[start] node_modules missing, installing dependencies...');
  const result = spawnSync('npm', ['install'], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function startServices() {
  const commands = [
    { label: 'api', cmd: 'npm', args: ['run', 'dev:api'] },
    { label: 'web', cmd: 'npm', args: ['run', 'dev:web'] }
  ];

  const children = commands.map(({ cmd, args }) =>
    spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  );

  const shutdown = (signal) => {
    console.log(`[start] received ${signal}, shutting down...`);
    for (const child of children) {
      child.kill(signal);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

ensureEnv();
ensureDependencies();
startServices();
