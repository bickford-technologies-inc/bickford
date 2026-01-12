# Decision Continuity Runtime (DCR)

A critical runtime architecture designed to enable immutable decision tracking, optimal path scoring (OPTR), and governance enforcement through promotion gates. Built for trustable, scalable, and secure systems for autonomous workflows with persistent session layer for cross-device continuity and IP protection safeguards.

## Overview

The Decision Continuity Runtime provides a comprehensive framework for:

- **Immutable Decision Tracking** - Record all decisions with cryptographic integrity
- **Optimal Path Scoring (OPTR)** - Evaluate and recommend the best decision paths
- **Governance Enforcement** - Control decision promotion through validation gates
- **Persistent Session Layer** - Enable cross-device workflow continuity
- **IP Protection** - Safeguard intellectual property while enabling integration

## Architecture

### Core Components

1. **DecisionTracker** - Immutable blockchain-like decision tracking
2. **OptimalPathScorer** - Multi-criteria path evaluation and recommendation
3. **GovernanceGate** - Stage-based promotion with validation rules
4. **SessionManager** - Persistent session management with checkpoints
5. **IPProtector** - Access control and data sanitization

## Installation

```bash
npm install
```

## Quick Start

```javascript
import { DecisionContinuityRuntime } from './src/index.js';

// Initialize the runtime
const dcr = new DecisionContinuityRuntime({
  governance: {
    stages: ['development', 'staging', 'production']
  },
  session: {
    persistence: true
  }
});

await dcr.initialize();

// Create a session
const session = await dcr.createSession({
  userId: 'user123',
  context: 'workflow-automation'
});

// Record a decision
const decision = await dcr.recordDecision({
  type: 'deployment',
  action: 'deploy-service-a',
  parameters: { version: '1.0.0' }
}, session.id);

console.log('Decision recorded:', decision.id);
```

## Features

### 1. Immutable Decision Tracking

Record decisions with cryptographic integrity ensuring auditability and tamper-proof history:

```javascript
const decision = await dcr.recordDecision({
  type: 'approval',
  action: 'approve-change',
  approver: 'admin',
  reason: 'meets all criteria'
});

// Verify integrity of decision chain
const integrity = dcr.verifyIntegrity();
console.log('Chain valid:', integrity.decisionChainValid);
```

### 2. Optimal Path Scoring (OPTR)

Evaluate multiple decision paths based on cost, time, risk, and quality:

```javascript
const paths = [
  {
    id: 'path-1',
    name: 'Fast deployment',
    metrics: { cost: 70, time: 20, risk: 60, quality: 70 }
  },
  {
    id: 'path-2',
    name: 'Safe deployment',
    metrics: { cost: 50, time: 60, risk: 10, quality: 90 }
  }
];

const recommendation = dcr.evaluatePaths(paths);
console.log('Recommended:', recommendation.recommended.path.name);
console.log('Confidence:', recommendation.confidence);
```

### 3. Governance Gates

Control decision promotion through stages with validation rules:

```javascript
// Add validation rule
dcr.governanceGate.addRule('production', async (decision) => {
  if (!decision.decision.approver) {
    return { valid: false, message: 'Approval required for production' };
  }
  return { valid: true };
});

// Promote decision
const promotion = await dcr.promoteDecision(
  decision.id,
  'production',
  { approvedBy: 'admin' }
);

console.log('Promotion successful:', promotion.success);
```

### 4. Session Continuity

Create persistent sessions that can be resumed across devices:

```javascript
// Create session
const session = await dcr.createSession({ 
  workflowId: 'wf-123' 
});

// Create checkpoint
const checkpoint = await dcr.createCheckpoint(
  session.id, 
  'Before critical operation'
);

// Resume on another device
const resumed = await dcr.resumeSession(session.id, {
  deviceId: 'device-456',
  platform: 'web'
});

// Restore to checkpoint if needed
await dcr.restoreCheckpoint(session.id, checkpoint.id);
```

### 5. IP Protection

Secure integration with access control and data sanitization:

```javascript
// Register integration
const integration = dcr.registerIntegration('external-system', {
  read: true,
  write: false
});

// Export with IP protection
const exportData = dcr.exportDecisions(
  'external-system',
  integration.token,
  ['internalNotes', 'costDetails']
);

console.log('Sanitized export:', exportData);
```

## API Reference

### DecisionContinuityRuntime

Main runtime class that orchestrates all components.

#### Methods

- `initialize()` - Initialize the runtime (required before use)
- `recordDecision(decision, sessionId?)` - Record a new decision
- `evaluatePaths(paths)` - Score and recommend optimal path
- `promoteDecision(decisionId, targetStage, metadata?)` - Promote decision
- `createSession(sessionData?)` - Create new session
- `resumeSession(sessionId, deviceInfo?)` - Resume existing session
- `createCheckpoint(sessionId, description?)` - Create session checkpoint
- `restoreCheckpoint(sessionId, checkpointId)` - Restore to checkpoint
- `registerIntegration(integrationId, permissions?)` - Register integration
- `exportDecisions(integrationId, token, sensitiveFields?)` - Export with IP protection
- `getStatus()` - Get runtime status
- `verifyIntegrity()` - Verify system integrity

### DecisionTracker

Immutable decision tracking with cryptographic verification.

### OptimalPathScorer

Multi-criteria path scoring and recommendation.

### GovernanceGate

Stage-based governance with validation rules.

### SessionManager

Persistent session management with cross-device support.

### IPProtector

IP protection and secure integration management.

## Examples

See the `examples/` directory for detailed usage examples:

- `basic.js` - Basic decision tracking
- `optimal-path.js` - Path scoring and recommendations
- `governance.js` - Promotion gates and validation
- `session-continuity.js` - Cross-device sessions
- `ip-protection.js` - Secure integration

Run examples:
```bash
node examples/basic.js
node examples/optimal-path.js
node examples/governance.js
node examples/session-continuity.js
node examples/ip-protection.js
```

## Configuration

```javascript
const config = {
  scoringWeights: {
    cost: 0.3,
    time: 0.3,
    risk: 0.2,
    quality: 0.2
  },
  governance: {
    stages: ['development', 'staging', 'production']
  },
  session: {
    sessionDir: '.sessions',
    persistence: true
  },
  security: {
    encryptionEnabled: true,
    watermarkEnabled: true
  }
};
```

## Security Considerations

1. **Encryption** - Session data can be encrypted at rest
2. **Access Control** - Token-based integration authentication
3. **Data Sanitization** - Automatic redaction of sensitive fields
4. **Audit Trail** - Complete access logging for compliance
5. **Watermarking** - Tracking data distribution
6. **Immutability** - Tamper-proof decision history

## Use Cases

- Autonomous deployment pipelines
- Multi-stage approval workflows
- Cross-device document collaboration
- Secure third-party integrations
- Compliance and audit trails
- Decision analytics and reporting

## License

MIT