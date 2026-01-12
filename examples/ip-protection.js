/**
 * Example: IP Protection and Secure Integration
 * Demonstrates secure data export with access control
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function ipProtectionExample() {
  console.log('=== IP Protection Example ===\n');

  // Initialize with security config
  const dcr = new DecisionContinuityRuntime({
    security: {
      encryptionEnabled: true,
      watermarkEnabled: true
    }
  });
  await dcr.initialize();

  // Record some decisions with sensitive data
  console.log('Recording decisions with sensitive data...');
  await dcr.recordDecision({
    type: 'pricing',
    action: 'update-pricing',
    internalCost: 45.50,
    retailPrice: 99.99,
    apiKey: 'sk-secret-12345',
    reason: 'Market adjustment'
  });

  await dcr.recordDecision({
    type: 'contract',
    action: 'sign-contract',
    clientId: 'client-789',
    contractValue: 250000,
    internalNotes: 'Special discount applied',
    publicStatus: 'active'
  });

  // Register a legitimate integration
  console.log('\nRegistering analytics integration...');
  const analytics = dcr.registerIntegration('analytics-service', {
    read: true,
    write: false,
    scope: ['metrics', 'usage']
  });
  console.log('Integration registered');

  // Export data securely
  console.log('\nExporting data with IP protection...');
  const exportData = dcr.exportDecisions(
    'analytics-service',
    analytics.token,
    ['internalCost', 'contractValue', 'internalNotes']
  );

  console.log('Export details:');
  console.log('Total decisions:', exportData.decisions.length);
  console.log('Verified:', exportData.verified);
  console.log('Watermarked:', !!exportData._watermark);

  // Try unauthorized access
  console.log('\nAttempting unauthorized access...');
  try {
    dcr.exportDecisions('unknown-service', 'invalid-token');
    console.log('❌ Should have been blocked!');
  } catch (error) {
    console.log('✓ Access blocked:', error.message);
  }

  // Revoke access
  console.log('\nRevoking analytics access...');
  dcr.ipProtector.revokeAccess('analytics-service');
  console.log('✓ Access revoked');

  // View access log
  console.log('\nRecent access log:');
  const accessLog = dcr.ipProtector.getAccessLog();
  accessLog.slice(-3).forEach(entry => {
    console.log(`  ${entry.status.toUpperCase()}: ${entry.integrationId}`);
  });
}

ipProtectionExample().catch(console.error);
