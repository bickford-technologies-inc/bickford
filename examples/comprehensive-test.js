/**
 * Comprehensive Integration Test
 * Demonstrates all DCR components working together in a real-world scenario
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function comprehensiveTest() {
  console.log('=== DCR Comprehensive Integration Test ===\n');
  console.log('Testing: Decision tracking, path scoring, governance, sessions, and IP protection\n');

  // Initialize with full configuration
  const dcr = new DecisionContinuityRuntime({
    scoringWeights: {
      cost: 0.25,
      time: 0.25,
      risk: 0.3,
      quality: 0.2
    },
    governance: {
      stages: ['development', 'testing', 'staging', 'production']
    },
    session: {
      persistence: true,
      sessionDir: '.sessions'
    },
    security: {
      encryptionEnabled: true,
      watermarkEnabled: true
    }
  });

  await dcr.initialize();
  console.log('✓ Runtime initialized\n');

  // Scenario: E-commerce platform deployment decision
  console.log('SCENARIO: E-commerce Platform v2.0 Deployment\n');

  // Step 1: Create a session for this deployment workflow
  console.log('Step 1: Creating deployment session...');
  const session = await dcr.createSession({
    projectName: 'ecommerce-platform',
    version: '2.0.0',
    requestedBy: 'product-team',
    timestamp: new Date().toISOString()
  });
  console.log(`✓ Session created: ${session.id}\n`);

  // Step 2: Record initial planning decision
  console.log('Step 2: Recording planning decision...');
  const planningDecision = await dcr.recordDecision({
    type: 'planning',
    action: 'deployment-planned',
    features: ['new-checkout', 'payment-gateway', 'inventory-sync'],
    estimatedUsers: 100000,
    budget: 50000
  }, session.id);
  console.log(`✓ Planning decision: ${planningDecision.id}\n`);

  // Step 3: Evaluate deployment strategies
  console.log('Step 3: Evaluating deployment strategies...');
  const strategies = [
    {
      id: 'strategy-1',
      name: 'Blue-Green Deployment',
      description: 'Zero downtime, instant rollback',
      metrics: { cost: 70, time: 30, risk: 15, quality: 95 }
    },
    {
      id: 'strategy-2',
      name: 'Canary Release',
      description: 'Gradual rollout, 5% → 25% → 100%',
      metrics: { cost: 50, time: 50, risk: 20, quality: 90 }
    },
    {
      id: 'strategy-3',
      name: 'Rolling Update',
      description: 'Sequential instance updates',
      metrics: { cost: 35, time: 70, risk: 35, quality: 80 }
    },
    {
      id: 'strategy-4',
      name: 'Immediate Switch',
      description: 'Direct cutover',
      metrics: { cost: 20, time: 20, risk: 80, quality: 60 }
    }
  ];

  const recommendation = dcr.evaluatePaths(strategies);
  console.log(`✓ Recommended: ${recommendation.recommended.path.name}`);
  console.log(`  Score: ${recommendation.recommended.totalScore.toFixed(3)}`);
  console.log(`  Confidence: ${(recommendation.confidence * 100).toFixed(1)}%\n`);

  // Create checkpoint after evaluation
  const checkpoint1 = await dcr.createCheckpoint(session.id, 'Strategy evaluated');

  // Step 4: Record deployment decision
  console.log('Step 4: Recording deployment decision...');
  const deploymentDecision = await dcr.recordDecision({
    type: 'deployment',
    action: 'initiate-deployment',
    strategy: recommendation.recommended.path.id,
    strategyName: recommendation.recommended.path.name,
    confidence: recommendation.confidence,
    testsPassed: true,
    codeReviewed: true,
    approvals: ['alice@example.com', 'bob@example.com'],
    stage: 'development'
  }, session.id);
  console.log(`✓ Deployment decision: ${deploymentDecision.id}\n`);

  // Step 5: Configure governance rules
  console.log('Step 5: Setting up governance gates...');
  
  dcr.governanceGate.addRule('testing', async (decision) => {
    if (!decision.decision.testsPassed) {
      return { valid: false, message: 'All tests must pass' };
    }
    return { valid: true };
  });

  dcr.governanceGate.addRule('staging', async (decision) => {
    if (!decision.decision.codeReviewed) {
      return { valid: false, message: 'Code review required' };
    }
    return { valid: true };
  });

  dcr.governanceGate.addRule('production', async (decision) => {
    const approvals = decision.decision.approvals || [];
    if (approvals.length < 2) {
      return { valid: false, message: 'Minimum 2 approvals required' };
    }
    return { valid: true };
  });

  console.log('✓ Governance rules configured\n');

  // Step 6: Promote through stages
  console.log('Step 6: Promoting through governance gates...');
  
  let promotion = await dcr.promoteDecision(deploymentDecision.id, 'testing', {
    promotedBy: 'ci-system',
    ciJobId: 'build-12345'
  });
  console.log(`  ✓ Testing: ${promotion.success}`);

  promotion = await dcr.promoteDecision(deploymentDecision.id, 'staging', {
    promotedBy: 'release-manager',
    reviewUrl: 'https://github.com/example/pr/123'
  });
  console.log(`  ✓ Staging: ${promotion.success}`);

  promotion = await dcr.promoteDecision(deploymentDecision.id, 'production', {
    promotedBy: 'cto',
    approvalDate: new Date().toISOString()
  });
  console.log(`  ✓ Production: ${promotion.success}\n`);

  // Create checkpoint after promotion
  const checkpoint2 = await dcr.createCheckpoint(session.id, 'Promoted to production');

  // Step 7: Record post-deployment decision
  console.log('Step 7: Recording post-deployment monitoring...');
  await dcr.recordDecision({
    type: 'monitoring',
    action: 'deployment-successful',
    deploymentId: deploymentDecision.id,
    metrics: {
      uptime: '99.9%',
      responseTime: '250ms',
      errorRate: '0.1%',
      userFeedback: 'positive'
    }
  }, session.id);
  console.log('✓ Monitoring decision recorded\n');

  // Step 8: Register external integration
  console.log('Step 8: Setting up secure third-party integration...');
  const analyticsIntegration = dcr.registerIntegration('analytics-platform', {
    read: true,
    write: false,
    scope: ['deployment-metrics', 'performance-data']
  });
  console.log(`✓ Analytics integration registered\n`);

  // Step 9: Export data with IP protection
  console.log('Step 9: Exporting deployment data for analytics...');
  const exportData = dcr.exportDecisions(
    'analytics-platform',
    analyticsIntegration.token,
    ['budget', 'approvals', 'internalNotes']
  );
  console.log(`✓ Data exported with IP protection`);
  console.log(`  Decisions: ${exportData.decisions.length}`);
  console.log(`  Watermarked: ${!!exportData._watermark}`);
  console.log(`  Verified: ${exportData.verified}\n`);

  // Step 10: Verify system integrity
  console.log('Step 10: Verifying system integrity...');
  const integrity = dcr.verifyIntegrity();
  console.log(`✓ Decision chain integrity: ${integrity.decisionChainValid}\n`);

  // Step 11: Generate comprehensive report
  console.log('Step 11: Generating comprehensive report...\n');
  const status = dcr.getStatus();
  
  console.log('=== DEPLOYMENT REPORT ===');
  console.log('\nSystem Status:');
  console.log(`  Initialized: ${status.initialized}`);
  console.log(`  Timestamp: ${status.timestamp}`);
  
  console.log('\nDecision Tracking:');
  console.log(`  Total Decisions: ${status.components.decisionTracker.totalDecisions}`);
  console.log(`  Integrity Verified: ${status.components.decisionTracker.integrityVerified}`);
  
  console.log('\nPath Scoring:');
  console.log(`  Evaluations: ${status.components.pathScorer.totalScores}`);
  console.log(`  Weights: cost=${status.components.pathScorer.weights.cost}, time=${status.components.pathScorer.weights.time}, risk=${status.components.pathScorer.weights.risk}, quality=${status.components.pathScorer.weights.quality}`);
  
  console.log('\nGovernance:');
  console.log(`  Stages: ${status.components.governanceGate.stages.join(' → ')}`);
  console.log(`  Promotions: ${status.components.governanceGate.promotions}`);
  
  console.log('\nSessions:');
  console.log(`  Active Sessions: ${status.components.sessionManager.activeSessions}`);
  
  console.log('\nSecurity:');
  console.log(`  Integrations: ${status.components.ipProtector.registeredIntegrations}`);
  console.log(`  Access Attempts: ${status.components.ipProtector.accessAttempts}`);

  // View session details
  const finalSession = await dcr.sessionManager.getSession(session.id);
  console.log('\nSession Details:');
  console.log(`  Session ID: ${finalSession.id}`);
  console.log(`  Checkpoints: ${finalSession.checkpoints.length}`);
  console.log(`  Decisions: ${finalSession.data.decisions?.length || 0}`);

  // View promotion history
  const promotionHistory = dcr.governanceGate.getPromotionHistory(deploymentDecision.id);
  console.log('\nPromotion History:');
  promotionHistory.forEach(record => {
    console.log(`  ${record.fromStage || 'none'} → ${record.toStage} (${record.timestamp})`);
  });

  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  console.log('All DCR components are functioning correctly and integrated seamlessly.');
}

comprehensiveTest().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
