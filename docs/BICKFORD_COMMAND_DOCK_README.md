# Bickford Command Dock — Integration & Usage

## What is it?

A codex-style command dock for intent capture, authority binding, and deterministic execution. Not a chat bubble. Not ephemeral. Not multi-persona.

## Usage

- Input: `Ask bickford`
- Every submission is normalized, signed, and logged.
- All intents are persisted to `datalake/bronze/messages/` and `ledger/decisions.jsonl`.

## Architecture

- UI: `/components/BickfordCommandDock.tsx`
- Ledger: `/ledger/decisions.jsonl`
- Bronze: `/datalake/bronze/messages/`
- Scripts: `/scripts/append-intent-to-ledger.ts`, `/scripts/replay-ledger.ts`

## Governance

- Append-only, authority-bound, replayable.
- No UI mutation without ledger update.

## Extending

- Add model orchestration, OPTR, and Codex integration as needed.
- All actions must be authority-bound and ledgered.
