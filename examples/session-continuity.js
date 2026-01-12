/**
 * Example: Session Continuity
 * Demonstrates cross-device session management with checkpoints
 */
import { DecisionContinuityRuntime } from '../src/index.js';

async function sessionExample() {
  console.log('=== Session Continuity Example ===\n');

  // Initialize with persistence
  const dcr = new DecisionContinuityRuntime({
    session: {
      persistence: true,
      sessionDir: '.sessions'
    }
  });
  await dcr.initialize();

  // Create a session
  console.log('Starting session on desktop...');
  const session = await dcr.createSession({
    userId: 'user123',
    workflowType: 'document-approval',
    startedOn: 'desktop'
  });
  console.log('Session ID:', session.id);

  // Record some decisions
  console.log('\nRecording decisions on desktop...');
  await dcr.recordDecision({
    action: 'open-document',
    documentId: 'doc-456'
  }, session.id);

  await dcr.recordDecision({
    action: 'review-section',
    section: 'introduction',
    status: 'approved'
  }, session.id);

  // Create checkpoint
  console.log('\nCreating checkpoint...');
  const checkpoint1 = await dcr.createCheckpoint(
    session.id,
    'Completed introduction review'
  );
  console.log('Checkpoint ID:', checkpoint1.id);

  // Continue work
  await dcr.recordDecision({
    action: 'review-section',
    section: 'methodology',
    status: 'approved'
  }, session.id);

  // Create another checkpoint
  const checkpoint2 = await dcr.createCheckpoint(
    session.id,
    'Completed methodology review'
  );

  // Simulate resuming on mobile
  console.log('\nResuming session on mobile device...');
  const resumed = await dcr.resumeSession(session.id, {
    deviceType: 'mobile',
    platform: 'iOS',
    deviceId: 'iphone-789'
  });
  console.log('Resumed on:', resumed.deviceHistory[resumed.deviceHistory.length - 1].device.platform);

  // Continue work on mobile
  await dcr.recordDecision({
    action: 'review-section',
    section: 'results',
    status: 'needs-revision'
  }, session.id);

  // Restore to checkpoint
  console.log('\nRestoring to checkpoint...');
  await dcr.restoreCheckpoint(session.id, checkpoint2.id);
  console.log('Restored to: Completed methodology review');

  // View session history
  const finalSession = await dcr.sessionManager.getSession(session.id);
  console.log('\nSession summary:');
  console.log('Created:', finalSession.createdAt);
  console.log('Checkpoints:', finalSession.checkpoints.length);
  console.log('Devices used:', finalSession.deviceHistory.length);
}

sessionExample().catch(console.error);
