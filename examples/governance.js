/**
 * Example: Governance Gates
 * Demonstrates promotion through stages with validation
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function governanceExample() {
  console.log('=== Governance Gates Example ===\n');

  // Initialize with governance stages
  const dcr = new DecisionContinuityRuntime({
    governance: {
      stages: ['development', 'testing', 'staging', 'production']
    }
  });
  await dcr.initialize();

  // Add validation rules
  console.log('Setting up governance rules...');

  // Testing stage requires tests to pass
  dcr.governanceGate.addRule('testing', async (decision) => {
    if (!decision.decision.testsPassed) {
      return { 
        valid: false, 
        message: 'All tests must pass before promotion to testing' 
      };
    }
    return { valid: true };
  });

  // Staging requires code review
  dcr.governanceGate.addRule('staging', async (decision) => {
    if (!decision.decision.codeReviewed) {
      return { 
        valid: false, 
        message: 'Code review required for staging promotion' 
      };
    }
    return { valid: true };
  });

  // Production requires multiple approvals
  dcr.governanceGate.addRule('production', async (decision) => {
    const approvals = decision.decision.approvals || [];
    if (approvals.length < 2) {
      return { 
        valid: false, 
        message: 'Minimum 2 approvals required for production' 
      };
    }
    return { valid: true };
  });

  // Record a decision without requirements first
  console.log('\nRecording deployment decision without requirements...');
  const decision1 = await dcr.recordDecision({
    type: 'deployment',
    service: 'payment-api',
    version: '3.0.0',
    stage: 'development'
  });
  console.log('Decision ID:', decision1.id);

  // Attempt promotion without meeting requirements
  console.log('\nAttempting premature promotion to production...');
  let promotion = await dcr.promoteDecision(decision1.id, 'production');
  if (!promotion.success) {
    console.log('❌ Promotion blocked:');
    promotion.validation.errors.forEach(error => console.log('  -', error));
  }

  // Record a new decision with all requirements met
  console.log('\nRecording new decision with requirements met...');
  const decision = await dcr.recordDecision({
    type: 'deployment',
    service: 'payment-api',
    version: '3.0.0',
    stage: 'development',
    testsPassed: true,
    codeReviewed: true,
    approvals: ['alice@example.com', 'bob@example.com']
  });
  console.log('✓ Tests passed');
  console.log('✓ Code reviewed');
  console.log('✓ Approvals obtained');
  console.log('New Decision ID:', decision.id);

  // Promote through stages
  console.log('\nPromoting through stages...');
  
  promotion = await dcr.promoteDecision(decision.id, 'testing', {
    promotedBy: 'ci-system'
  });
  console.log('✓ Promoted to testing:', promotion.success);

  promotion = await dcr.promoteDecision(decision.id, 'staging', {
    promotedBy: 'release-manager'
  });
  console.log('✓ Promoted to staging:', promotion.success);

  promotion = await dcr.promoteDecision(decision.id, 'production', {
    promotedBy: 'release-manager'
  });
  console.log('✓ Promoted to production:', promotion.success);

  // View promotion history
  console.log('\nPromotion history:');
  const history = dcr.governanceGate.getPromotionHistory(decision.id);
  history.forEach(record => {
    console.log(`  ${record.fromStage} → ${record.toStage} at ${record.timestamp}`);
  });
}

governanceExample().catch(console.error);
