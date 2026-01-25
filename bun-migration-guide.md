# Bun Migration Guide for Bickford

## Overview

This guide walks you through migrating Bickford from Node.js (pnpm) to Bun for maximum performance, developer experience, and future-proofing.

---

## 1. Prerequisites

- Bun 1.0+ ([install](https://bun.sh))
- Node.js (for fallback)
- Backup your repo and lockfiles

---

## 2. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
bun --version
```

---

## 3. Update package.json

- Add: `"packageManager": "bun@1.0.0"`
- Update scripts:
  - Replace `pnpm`/`npm` with `bun` (e.g., `bun run build`, `bun test`)
- Add Bun types:

```bash
bun add -d bun-types @types/bun
```

---

## 4. Remove Node-specific lockfiles

```bash
rm pnpm-lock.yaml package-lock.json
bun install
```

---

## 5. Replace Node.js APIs

- `node-fetch`/`axios` → native `fetch`
- `dotenv` → `Bun.env`
- `jest` → `bun:test`
- `ts-node` → Bun native TypeScript
- `@swc/core` → Bun bundler

---

## 6. Update tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["bun-types"],
    "module": "ESNext",
    "target": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler"
  }
}
```

---

## 7. Update CI/CD

- Use `oven-sh/setup-bun` in GitHub Actions
- Replace `actions/setup-node`
- Use `bun install`, `bun run build`, `bun test`

---

## 8. Test Everything

```bash
bun run build
bun test
```

---

## 9. Troubleshooting

- **Module not found:** `bun install`
- **Type errors:** `bun add -d bun-types @types/bun`
- **Test failures:** Migrate from Jest to bun:test
- **Legacy packages:** Check Bun compatibility or use Node fallback

---

## 10. Migration Checklist

- [ ] Bun installed
- [ ] package.json updated
- [ ] Lockfiles migrated
- [ ] All scripts use Bun
- [ ] Node-specific deps replaced
- [ ] CI/CD updated
- [ ] All tests passing
- [ ] Docs updated

---

## Resources

- [Bun Docs](https://bun.sh/docs)
- [Migration FAQ](https://bun.sh/docs/migration)
- [Discord](https://bun.sh/discord)
