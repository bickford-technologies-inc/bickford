import { spawnSync } from 'node:child_process';

function runStep(label, command, args) {
  const pretty = [command, ...args].join(' ');
  console.log(`\n=== ${label} ===\n$ ${pretty}\n`);

  const r = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (r.error) {
    console.error(`\n[smoke] Failed to start step: ${label}`);
    console.error(r.error);
    process.exit(1);
  }

  const code = r.status ?? 1;
  if (code !== 0) {
    console.error(`\n[smoke] Step failed: ${label} (exit ${code})`);
    console.error(`[smoke] Tip: re-run just this step via: ${pretty}`);
    process.exit(code);
  }
}

runStep('Typecheck/Lint (all workspaces)', 'npm', ['--workspaces', 'run', 'lint']);
runStep('Demo A', 'npm', ['run', 'demo:a']);
runStep('Demo C', 'npm', ['run', 'demo:c']);

console.log('\n[smoke] All steps succeeded.\n');
