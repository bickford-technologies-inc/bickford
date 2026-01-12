# Decision Continuity Runtime - Quick Start Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/bickfordd-bit/session-completion-runtime.git
cd session-completion-runtime

# No dependencies required - uses Node.js built-ins
node --version  # Ensure Node.js 18+ is installed
```

## 5-Minute Tutorial

### Step 1: Import the Runtime

```javascript
import { DecisionContinuityRuntime } from './src/index.js';
```

### Step 2: Initialize

```javascript
const dcr = new DecisionContinuityRuntime();
await dcr.initialize();
```

### Step 3: Record Your First Decision

```javascript
const decision = await dcr.recordDecision({
  type: 'deployment',
  action: 'deploy-service',
  service: 'my-api',
  version: '1.0.0'
});

console.log('Decision ID:', decision.id);
```

### Step 4: Evaluate Paths

```javascript
const paths = [
  {
    id: 'fast',
    name: 'Fast Deployment',
    metrics: { cost: 60, time: 20, risk: 50, quality: 70 }
  },
  {
    id: 'safe',
    name: 'Safe Deployment',
    metrics: { cost: 40, time: 60, risk: 10, quality: 90 }
  }
];

const recommendation = dcr.evaluatePaths(paths);
console.log('Best option:', recommendation.recommended.path.name);
```

### Step 5: Add Governance

```javascript
// Add a validation rule
dcr.governanceGate.addRule('production', async (decision) => {
  if (!decision.decision.approved) {
    return { valid: false, message: 'Approval required' };
  }
  return { valid: true };
});

// Promote decision
const promotion = await dcr.promoteDecision(decision.id, 'production');
console.log('Promoted:', promotion.success);
```

## Common Patterns

### Pattern 1: Decision Pipeline

```javascript
// 1. Record decision
const decision = await dcr.recordDecision({ /* ... */ });

// 2. Evaluate options
const best = dcr.evaluatePaths(options);

// 3. Promote through stages
await dcr.promoteDecision(decision.id, 'staging');
await dcr.promoteDecision(decision.id, 'production');

// 4. Verify integrity
const integrity = dcr.verifyIntegrity();
```

### Pattern 2: Session Workflow

```javascript
// Create session
const session = await dcr.createSession({ userId: 'user123' });

// Record decisions in session
await dcr.recordDecision({ action: 'step1' }, session.id);

// Create checkpoint
const cp = await dcr.createCheckpoint(session.id, 'Step 1 complete');

// Continue work
await dcr.recordDecision({ action: 'step2' }, session.id);

// Rollback if needed
await dcr.restoreCheckpoint(session.id, cp.id);
```

### Pattern 3: Secure Integration

```javascript
// Register integration
const integration = dcr.registerIntegration('external-app', {
  read: true
});

// Share token with external system
console.log('Token:', integration.token);

// Export data securely
const data = dcr.exportDecisions(
  'external-app',
  integration.token,
  ['sensitiveField']
);
```

## Configuration Examples

### Custom Scoring Weights

```javascript
const dcr = new DecisionContinuityRuntime({
  scoringWeights: {
    cost: 0.4,    // Prioritize cost
    time: 0.2,
    risk: 0.3,
    quality: 0.1
  }
});
```

### Custom Stages

```javascript
const dcr = new DecisionContinuityRuntime({
  governance: {
    stages: ['dev', 'qa', 'uat', 'staging', 'prod']
  }
});
```

### Persistent Sessions

```javascript
const dcr = new DecisionContinuityRuntime({
  session: {
    persistence: true,
    sessionDir: './my-sessions',
    encryptionKey: 'your-secure-key'
  }
});
```

## Running Examples

```bash
# Basic decision tracking
node examples/basic.js

# Path scoring
node examples/optimal-path.js

# Governance gates
node examples/governance.js

# Session continuity
node examples/session-continuity.js

# IP protection
node examples/ip-protection.js
```

## Troubleshooting

### Issue: "Runtime not initialized"

**Solution**: Always call `await dcr.initialize()` before using the runtime.

```javascript
const dcr = new DecisionContinuityRuntime();
await dcr.initialize();  // Don't forget this!
```

### Issue: "Cannot add property, object is not extensible"

**Solution**: Decisions are immutable. Create new decisions instead of modifying:

```javascript
// ❌ Wrong
decision.decision.field = 'value';

// ✅ Correct
const newDecision = await dcr.recordDecision({
  ...oldDecision.decision,
  field: 'value'
});
```

### Issue: Session not persisting

**Solution**: Enable persistence in configuration:

```javascript
const dcr = new DecisionContinuityRuntime({
  session: { persistence: true }
});
```

## API Quick Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `initialize()` | Start runtime | `await dcr.initialize()` |
| `recordDecision()` | Track decision | `await dcr.recordDecision({...})` |
| `evaluatePaths()` | Score options | `dcr.evaluatePaths([...])` |
| `promoteDecision()` | Promote stage | `await dcr.promoteDecision(id, 'prod')` |
| `createSession()` | New session | `await dcr.createSession({...})` |
| `resumeSession()` | Continue session | `await dcr.resumeSession(id)` |
| `createCheckpoint()` | Save state | `await dcr.createCheckpoint(id)` |
| `registerIntegration()` | Add integration | `dcr.registerIntegration('app')` |
| `exportDecisions()` | Share data | `dcr.exportDecisions(id, token)` |
| `getStatus()` | Runtime status | `dcr.getStatus()` |
| `verifyIntegrity()` | Check integrity | `dcr.verifyIntegrity()` |

## Next Steps

1. **Read the full documentation**: See `README.md` for complete API reference
2. **Study the architecture**: Check `ARCHITECTURE.md` for system design
3. **Run the examples**: Explore `examples/` directory
4. **Build your workflow**: Start with a simple decision tracking use case
5. **Add governance**: Configure rules for your stages
6. **Enable persistence**: Set up session continuity

## Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Comprehensive docs in README.md and ARCHITECTURE.md
- **Examples**: Working examples in `examples/` directory

## License

MIT - See LICENSE file for details
