# RAILWAY_BUN_MIGRATION.md

## Railway Deployment Guide for Bickford Compounding Intelligence

---

## Prerequisites

- Railway CLI installed
- Bun 1.x installed
- Project files in `/workspaces/bickford/bickford-intelligence/`

---

## Steps

### 1. Initialize Railway

```bash
railway init
```

### 2. Link Project

```bash
railway link
```

### 3. Deploy

```bash
railway up
```

---

## Configuration

- Ensure `package.json` and `tsconfig.json` are present
- Use Bun-native scripts
- Set environment variables as needed:
  - `ANTHROPIC_API_KEY` for Claude integration
  - `ENABLE_COMPRESSION=true`
  - `COMPRESSION_RATIO=5000`

---

## Performance Expectations

- Cold start: ~500ms
- Execution time: ~0.5ms (after pattern learned)
- Compression: 5,000x (99.98% reduction)

---

## Monitoring

- Track metrics via `/api/metrics` endpoint
- Export patterns for audit

---

## Troubleshooting

- Ensure Bun is the runtime
- Check logs for errors
- Validate environment variables

---

**Decision recorded.**  
**Proof available.**
