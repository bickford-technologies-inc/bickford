# Bickford Canon Console

This is the governance enforcement UI for Bickford Constitutional AI.

## Structure

- `index.html` — Main UI
- `style.css` — Styles
- `main.js` — UI logic

## Local Development

```sh
bun run --cwd ./apps/canon-console index.html
```

## Build

```sh
bun build ./apps/canon-console --outdir ./dist/canon-console
```

## Deployment

- Deploy the contents of `dist/canon-console` to your static host (Vercel, Railway, S3, etc).
