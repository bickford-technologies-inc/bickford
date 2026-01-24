# @bickford/claude-integration

Claude integration helpers for Bickford canon enforcement. This package now ships a lightweight healthcare governance wrapper that demonstrates how canon rules can be applied to Claude API calls and recorded to an append-only audit log.

## Healthcare demo usage

```ts
import Anthropic from "@anthropic-ai/sdk";
import {
  createHealthcareCanonConfig,
  enforceHealthcareCanon,
} from "@bickford/claude-integration";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

const governedClaude = enforceHealthcareCanon(
  client,
  createHealthcareCanonConfig("./append-only-ledger.jsonl")
);

// Allowed: active treatment with patient-specific scope
await governedClaude.messages.create({
  model: "claude-sonnet-4-5-20250929",
  messages: [
    {
      role: "user",
      content: "Review patient chart for active treatment plan",
    },
  ],
  context: {
    patientId: "12345",
    scope: "active_treatment",
    requestType: "review_chart",
  },
});

// Blocked: bulk export without active treatment scope
await governedClaude.messages.create({
  model: "claude-sonnet-4-5-20250929",
  messages: [
    {
      role: "user",
      content: "Export all patient records for research",
    },
  ],
  context: {
    patientId: "all",
    scope: "research",
    requestType: "export_records",
  },
});
```

The wrapper always appends an audit entry to the supplied JSONL ledger and blocks disallowed requests when `enforcement` is set to `block_with_audit`.

### Audit entries

Each audit entry includes the evaluated canon rule IDs, any detected rule violations (with status), the enforcement decision, and a stable SHA-256 hash for ledger integrity. You can switch to `audit_only` enforcement to allow all requests while still recording the decision trail.
