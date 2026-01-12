# Workflows

## Continuous Git Sync (Auto pull/commit/push)

This repo includes an **opt-in** loop that continuously:

1. `git pull --rebase` (with autostash)
2. (optional) commit local changes
3. `git push`

### Start the loop

```bash
npm run git:sync:watch
```

Keep that terminal running.

### Safety defaults (important)

By default the sync **does not add new untracked files**. It stages only modifications/deletions to already-tracked files (`git add -u`).

This reduces the risk of accidentally committing secrets or scratch files.

If you explicitly want to auto-add new files too:

```bash
GIT_SYNC_ADD_NEW=1 npm run git:sync:watch
```

### If you don’t want it to commit

```bash
GIT_SYNC_NO_COMMIT=1 npm run git:sync:watch
```

It will still pull + push (push will be a no-op if there are no commits).

### Custom commit message

```bash
GIT_SYNC_MESSAGE="auto: savepoint" npm run git:sync
```

### What “forever” means

- This will run indefinitely **while the process is running**.
- If your Codespace stops/rebuilds, you’ll need to start it again.
- If a merge conflict happens, the loop will stop making progress until you resolve it manually.
