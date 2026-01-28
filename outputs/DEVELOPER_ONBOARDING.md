# Bickford Automation: Developer Onboarding

## 1. Install Bun

- Visit https://bun.sh and follow the install instructions for your OS.
- Verify with:
  ```bash
  bun --version
  ```

## 2. Run All Scripts

- All automation scripts are in `outputs/` and require Bun.
- Example:
  ```bash
  bun run outputs/validate_outputs.ts
  bun run outputs/run_full_workflow.ts
  bun run outputs/healthcheck.ts
  bun test outputs/tests/
  ```

## 3. Troubleshooting

- **Error: This script must be run with Bun**
  - Make sure you are using `bun run ...` and not `node ...`.
- **Permissions errors**
  - Ensure you have write access to the `outputs/` directory.
- **Missing files**
  - Run `bun run outputs/validate_outputs.ts` to auto-create all required files/dirs.

## 4. Help/Usage

- All major scripts support `--help`:

  ```bash
  bun run outputs/customer-acquisition/lead_generation.ts --help
  ```

- **List all available scripts and usage:**
  ```bash
  bun run outputs/list_scripts.ts
  ```

  - This prints all runnable scripts in outputs/ and subdirectories, with their usage/help output.

## 5. Extending/Contributing

- See `outputs/CONTRIBUTING.md` for code style and extension guidelines.

---

**All automation is Bun-native and self-healing.**
