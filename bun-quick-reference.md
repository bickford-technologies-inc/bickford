# Bun Quick Reference for Bickford Migration

## Node.js → Bun Patterns

| Node.js      | Bun (Replacement)        |
| ------------ | ------------------------ |
| `node-fetch` | native `fetch`           |
| `dotenv`     | `Bun.env`                |
| `jest`       | `bun:test`               |
| `ts-node`    | Bun native TypeScript    |
| `@swc/core`  | Bun bundler              |
| `axios`      | native `fetch` or `ky`   |
| `fs`         | `fs` (mostly compatible) |
| `crypto`     | `crypto` (same API)      |

---

## Common Gotchas

- No `__dirname` in ES modules: use `import.meta.url`
- Top-level await requires ES modules
- Some npm packages may not work (check Bun compatibility)
- Use `bun-types` for TypeScript
- Bun's `fetch` is always available (no import needed)

---

## Performance Tips

- Use Bun's native `fetch` and `Bun.file()` for I/O
- Use `bun:sqlite` for databases (10-100x faster)
- Use `Promise.all` for concurrency
- Bun's HTTP server (`Bun.serve`) is 3-5x faster than Express

---

## Bun CLI

```bash
bun install           # Install dependencies (3-6x faster)
bun run build         # Run build script
bun test              # Run tests
bun add <pkg>         # Add a package
bun remove <pkg>      # Remove a package
```

---

## TypeScript Setup

- Add `bun-types` and `@types/bun` to devDependencies
- Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["bun-types"],
    "module": "ESNext",
    "target": "ESNext"
  }
}
```

---

## Example: Environment Variables

```typescript
// Node.js
import dotenv from "dotenv";
dotenv.config();
const key = process.env.ANTHROPIC_API_KEY;

// Bun
const key = Bun.env.ANTHROPIC_API_KEY;
```

---

## Example: HTTP Requests

```typescript
// Node.js
import fetch from "node-fetch";
const res = await fetch(url);

// Bun
const res = await fetch(url); // No import needed
```

---

## Example: Testing

```typescript
// Node.js (Jest)
import { test } from "@jest/globals";

test("works", () => {
  expect(true).toBe(true);
});

// Bun (bun:test)
import { test, expect } from "bun:test";

test("works", () => {
  expect(true).toBe(true);
});
```

---

## More Resources

- [Bun Docs](https://bun.sh/docs)
- [Migration FAQ](https://bun.sh/docs/migration)
- [Discord](https://bun.sh/discord)
