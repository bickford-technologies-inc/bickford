/**
 * Example: Basic Decision Tracking
 * Demonstrates recording decisions and verifying integrity
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function basicExample() {
  console.log('=== Basic Decision Tracking Example ===\n');

  // Initialize runtime
  const dcr = new DecisionContinuityRuntime();
  await dcr.initialize();

  // Record some decisions
  console.log('Recording decisions...');
  const decision1 = await dcr.recordDecision({
    type: 'configuration',
    action: 'update-timeout',
    value: 30000,
    reason: 'Improve reliability'
  });
  console.log('Decision 1 ID:', decision1.id);

  const decision2 = await dcr.recordDecision({
    type: 'deployment',
    action: 'deploy-service',
    service: 'api-gateway',
    version: '1.2.0'
  });
  console.log('Decision 2 ID:', decision2.id);

  const decision3 = await dcr.recordDecision({
    type: 'scaling',
    action: 'scale-up',
    instances: 5,
    reason: 'High traffic expected'
  });
  console.log('Decision 3 ID:', decision3.id);

  // Verify integrity
  console.log('\nVerifying integrity...');
  const integrity = dcr.verifyIntegrity();
  console.log('Decision chain valid:', integrity.decisionChainValid);

  // Get status
  console.log('\nRuntime status:');
  const status = dcr.getStatus();
  console.log('Total decisions:', status.components.decisionTracker.totalDecisions);
  console.log('Integrity verified:', status.components.decisionTracker.integrityVerified);
}

basicExample().catch(console.error);
