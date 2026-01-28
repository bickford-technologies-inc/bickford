# OPTR Anthropic Batch Integration - Quickstart

## How to Run the Batch

1. **Run the batch integration:**

   ```bash
   bun run outputs/optr/optr_anthropic_batch_integration.ts
   ```

   - This will generate 1,000 OPTR compliance decisions (simulated if API credits are exhausted) and log them to `outputs/optr/optr_ledger.jsonl`.

2. **Verify the hash chain integrity:**
   ```bash
   bun run outputs/optr/verify_optr_ledger.ts
   ```

   - This will check every entry in the ledger for cryptographic integrity.

## Files

- `optr_anthropic_batch_integration.ts` — Runs the batch and logs to the ledger
- `optr_ledger.jsonl` — The hash-chained ledger file
- `verify_optr_ledger.ts` — Verifies the hash chain for external audit

## Notes

- If API credits are exhausted, the script will automatically switch to simulation mode.
- All entries are cryptographically linked; any tampering will be detected by the verifier.
