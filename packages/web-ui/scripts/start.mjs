// Start script for vite preview with PORT support
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const vitePath = resolve(__dirname, '../../../node_modules/.bin/vite');
const port = process.env.PORT || '4173';

const vite = spawn(vitePath, ['preview', '--port', port], {
  stdio: 'inherit',
  shell: false
});

vite.on('error', (error) => {
  console.error('Failed to start vite preview:', error);
  process.exit(1);
});

vite.on('exit', (code) => {
  process.exit(code || 0);
});
