import { spawn } from 'node:child_process';

const commands = [
  { label: 'api', cmd: 'npm', args: ['run', 'dev:api'] },
  { label: 'web', cmd: 'npm', args: ['run', 'dev:web'] },
  { label: 'mobile', cmd: 'npm', args: ['run', 'dev:mobile'] }
];

const children = commands.map(({ cmd, args }) =>
  spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
);

const shutdown = (signal) => {
  console.log(`[dev] received ${signal}, shutting down...`);
  for (const child of children) {
    child.kill(signal);
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.log(`[dev] child exited with code ${code}`);
    }
  });
}
