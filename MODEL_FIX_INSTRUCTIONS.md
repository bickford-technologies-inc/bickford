# Claude Model Name Fix Instructions

## Problem

You are using invalid Claude model names in your codebase, such as:

- `claude-3-sonnet-20250514`
- `claude-sonnet-4-20250514`
- `claude-sonnet-4-5-20250929`

These do **not** exist in the Anthropic API as of January 2026 and will cause 404 errors.

## Solution

**Use this model name instead:**

```
claude-3-5-sonnet-20241022
```

## How to Fix (Recommended)

1. Run the provided script:

   ```bash
   chmod +x quick-fix.sh
   ./quick-fix.sh
   ```

   This will automatically update all files in your repo to use the correct model name.

2. Re-run your demos:
   ```bash
   ./demo-runner.sh
   ```

## Manual Fix (if needed)

- Search for any of these strings in your codebase:
  - `claude-3-sonnet-20250514`
  - `claude-sonnet-4-20250514`
  - `claude-sonnet-4-5-20250929`
- Replace with:
  - `claude-3-5-sonnet-20241022`

## Valid Claude Models (Jan 2026)

- `claude-3-5-sonnet-20241022` (RECOMMENDED)
- `claude-3-5-sonnet-20240620`
- `claude-3-sonnet-20240229`
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

## Test Your Fix

After updating, run:

```bash
./demo-runner.sh
```

You should see all demos complete successfully with no 404 errors.

---

**If you still get errors, check your API key and model access.**
