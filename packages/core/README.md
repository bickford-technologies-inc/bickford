# Bickford Drift Prevention Enforcer (Bun)

This package provides industrial-grade, production-ready drift prevention for LLMs, implementing enforcement for all major drift scenarios described in Anthropic's "Assistant Axis" research and Bickford's enterprise enforcement layer.

## Features

- Emotional mirroring prevention (activation capping)
- Persona jailbreak detection
- Instruction integrity/context drift enforcement
- Linguistic drift detection
- Regulatory truth-tethering
- Unified pipeline for all checks
- Cryptographic proof chain for every enforcement event
- Bun-optimized, TypeScript-compatible

## Usage

### Run Example

```bash
bun run packages/core/driftEnforcer.bun.ts
```

### Run Tests

```bash
bun test packages/core/__tests__/driftEnforcer.bun.test.ts
```

## Integration

Import and use the pipeline in your Claude/Bickford API wrapper or any LLM pipeline:

```typescript
import { runDriftPreventionPipeline } from "./driftEnforcer.bun";

const driftEvents = runDriftPreventionPipeline(
  neuralActivations,
  personaEmbedding,
  conversationHistory,
  initialConstraints,
  response,
);
```

## Artifacts

- All cryptographic proof chains and logs can be written to `artifacts/` for compliance and audit.

## intent.json

- See `intent.json` for the formalized intent and constraints governing this package.
