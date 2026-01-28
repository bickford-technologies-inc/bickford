# Bickford Automation: Contributing Guide

## Code Style

- TypeScript, strict mode preferred
- Use Bun-native APIs (see logger.ts for example)
- Lint with `outputs/.eslintrc.json`
- Format with `format_outputs.sh`

## Adding New Scripts

- Place new scripts in the appropriate `outputs/` subdirectory
- Add Bun environment check and `--help` flag
- Log all actions using `outputs/logger.ts`
- Update `outputs/healthcheck.ts` and `outputs/integration_test.ts` if your script is critical

## Testing

- Add tests to `outputs/tests/` using `bun:test`
- Run all tests with:
  ```bash
  bun test outputs/tests/
  ```

## Extension Points

- Look for `// TODO` and `// EXTENSION POINT` comments in code
- Add new features as modular scripts where possible

## PRs & Reviews

- PRs welcome for new automation, tests, or documentation
- Keep all automation Bun-native and self-healing

---

**Thank you for contributing to Bickford automation!**
