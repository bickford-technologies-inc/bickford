import { spawnSync } from 'node:child_process';

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: opts.stdio ?? 'pipe',
    encoding: 'utf8',
    env: process.env,
  });
  return r;
}

function must(r, label) {
  if (r.error) throw new Error(`${label}: ${r.error.message}`);
  const code = r.status ?? 1;
  if (code !== 0) {
    const out = (r.stdout || '') + (r.stderr || '');
    throw new Error(`${label}: exit ${code}${out ? `\n${out.trim()}` : ''}`);
  }
  return r;
}

function trim(s) {
  return String(s ?? '').trim();
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function repoRoot() {
  const r = sh('git', ['rev-parse', '--show-toplevel']);
  if (r.status !== 0) return null;
  return trim(r.stdout);
}

function currentBranch() {
  const r = must(sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']), 'git branch');
  return trim(r.stdout);
}

function hasUpstream() {
  const r = sh('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  return r.status === 0;
}

function isDirty() {
  // Porcelain is stable for scripts
  const r = must(sh('git', ['status', '--porcelain']), 'git status');
  return trim(r.stdout).length > 0;
}

function hasStaged() {
  const r = sh('git', ['diff', '--cached', '--quiet']);
  return r.status === 1; // 1 means differences
}

function pullRebase() {
  // Make rebase + autostash behavior consistent without touching global config
  sh('git', ['config', '--local', 'pull.rebase', 'true']);
  sh('git', ['config', '--local', 'rebase.autoStash', 'true']);
  sh('git', ['config', '--local', 'fetch.prune', 'true']);

  must(sh('git', ['fetch', '--prune'], { stdio: 'inherit' }), 'git fetch');
  must(sh('git', ['pull', '--rebase', '--autostash'], { stdio: 'inherit' }), 'git pull --rebase');
}

function stageChanges({ includeNewFiles }) {
  // Safety default: ONLY stage modifications/deletions to already-tracked files.
  // This avoids accidentally committing new secret files.
  const args = includeNewFiles ? ['add', '-A'] : ['add', '-u'];
  must(sh('git', args, { stdio: 'inherit' }), `git ${args.join(' ')}`);
}

function commitIfNeeded({ message }) {
  if (!hasStaged()) return false;
  const msg = message || `auto: sync ${nowStamp()}`;
  must(sh('git', ['commit', '-m', msg], { stdio: 'inherit' }), 'git commit');
  return true;
}

function push() {
  must(sh('git', ['push'], { stdio: 'inherit' }), 'git push');
}

function main() {
  const root = repoRoot();
  if (!root) {
    console.error('[git-sync] Not a git repository.');
    process.exit(2);
  }

  const branch = currentBranch();
  if (branch === 'HEAD') {
    console.error('[git-sync] Detached HEAD; refusing to auto-sync.');
    process.exit(2);
  }

  if (!hasUpstream()) {
    console.error(`[git-sync] No upstream configured for branch "${branch}". Set one via:`);
    console.error(`  git push -u origin ${branch}`);
    process.exit(2);
  }

  const includeNewFiles = String(process.env.GIT_SYNC_ADD_NEW || '').trim() === '1';
  const message = process.env.GIT_SYNC_MESSAGE ? String(process.env.GIT_SYNC_MESSAGE) : undefined;
  const allowCommit = String(process.env.GIT_SYNC_NO_COMMIT || '').trim() !== '1';

  try {
    pullRebase();

    if (allowCommit && isDirty()) {
      stageChanges({ includeNewFiles });
      commitIfNeeded({ message });
    }

    push();
    console.log('[git-sync] OK');
  } catch (e) {
    console.error('[git-sync] FAILED');
    console.error(e?.message || e);
    console.error('[git-sync] If you hit a merge conflict, resolve it manually, then re-run.');
    process.exit(1);
  }
}

main();
