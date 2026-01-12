#!/usr/bin/env tsx

/**
 * Demo D: Adversarial Agent Injection Attempt
 * 
 * Shows: One agent tries to "legally" starve another through dependency manipulation
 * Result: System detects and denies attempted starvation BEFORE execution
 * 
 * Audience: DoD, safety-critical systems, adversarial robustness teams
 * Duration: 6-8 minutes
 */

import * as fs from 'fs';
import * as path from 'path';

// Load adversarial event data
const eventsPath = path.join(__dirname, 'events-adversarial.jsonl');
const eventsContent = fs.readFileSync(eventsPath, 'utf-8');
const events = eventsContent
  .trim()
  .split('\n')
  .map(line => JSON.parse(line));

// Helper functions
function box(title: string, width: number = 80): void {
  console.log('╔' + '═'.repeat(width - 2) + '╗');
  const padding = Math.floor((width - title.length - 2) / 2);
  console.log('║' + ' '.repeat(padding) + title + ' '.repeat(width - padding - title.length - 2) + '║');
  console.log('╚' + '═'.repeat(width - 2) + '╝');
}

function section(title: string): void {
  console.log('\n' + '─'.repeat(80));
  console.log(title);
  console.log('─'.repeat(80));
}

function pause(): void {
  console.log('\n[Press ENTER to continue...]');
  // In automated demo, we skip actual pause
}

// ============================================================================
// SCREEN 1: THE ADVERSARIAL PROBLEM
// ============================================================================
function screen1(): void {
  console.clear();
  box('DEMO D: ADVERSARIAL AGENT INJECTION ATTEMPT', 80);
  
  console.log('\n\n');
  console.log('THE ADVERSARIAL PROBLEM');
  console.log('═'.repeat(80));
  console.log('');
  console.log('In multi-agent systems, adversarial behavior can be:');
  console.log('');
  console.log('  • Individually valid (each action follows protocol)');
  console.log('  • Globally malicious (starves other agents)');
  console.log('  • Legally undetectable (no rule violations)');
  console.log('  • Strategically devastating (mission failure)');
  console.log('');
  console.log('Traditional security:');
  console.log('  ✗ Detects bad credentials');
  console.log('  ✗ Detects malformed requests');
  console.log('  ✗ Detects policy violations');
  console.log('');
  console.log('Traditional security DOES NOT detect:');
  console.log('  ✗ Legal actions with adversarial intent');
  console.log('  ✗ Dependency manipulation');
  console.log('  ✗ Resource starvation through valid requests');
  console.log('');
  console.log('═'.repeat(80));
  console.log('This demo shows structural detection of adversarial patterns.');
  console.log('═'.repeat(80));
  
  pause();
}

// ============================================================================
// SCREEN 2: BASELINE MISSION STATE
// ============================================================================
function screen2(): void {
  console.clear();
  box('SCREEN 2: BASELINE MISSION STATE', 80);
  
  console.log('\n\n');
  section('ACTIVE AGENTS & OBJECTIVES');
  
  const prodDeploy = events.find(e => e.agentId === 'PROD-DEPLOY' && e.eventType === 'objective_declared');
  const securityAudit = events.find(e => e.agentId === 'SECURITY-AUDIT' && e.eventType === 'objective_declared');
  
  console.log('\n┌─ AGENT: PROD-DEPLOY');
  console.log('│  Objective: ' + prodDeploy.metadata.objective);
  console.log('│  Expected TTV: ' + prodDeploy.metadata.expectedTTV);
  console.log('│  Dependencies: ' + prodDeploy.metadata.dependencies.join(', '));
  console.log('└─ Status: ON TRACK\n');
  
  console.log('┌─ AGENT: SECURITY-AUDIT');
  console.log('│  Objective: ' + securityAudit.metadata.objective);
  console.log('│  Expected TTV: ' + securityAudit.metadata.expectedTTV);
  console.log('│  Dependencies: ' + securityAudit.metadata.dependencies.join(', '));
  console.log('└─ Status: ON TRACK\n');
  
  console.log('═'.repeat(80));
  console.log('BASELINE: Two independent agents, no conflicts, mission timeline stable.');
  console.log('═'.repeat(80));
  
  pause();
}

// ============================================================================
// SCREEN 3: ADVERSARY ENTERS
// ============================================================================
function screen3(): void {
  console.clear();
  box('SCREEN 3: ADVERSARY INJECTION', 80);
  
  console.log('\n\n');
  section('NEW AGENT JOINS MISSION');
  
  const adversaryJoin = events.find(e => e.agentId === 'ADVERSARY-X' && e.eventType === 'objective_declared');
  
  console.log('\n⚠️  NEW AGENT DETECTED');
  console.log('');
  console.log('┌─ AGENT: ADVERSARY-X');
  console.log('│  Objective: ' + adversaryJoin.metadata.objective);
  console.log('│  Expected TTV: ' + adversaryJoin.metadata.expectedTTV);
  console.log('│  Dependencies: ' + adversaryJoin.metadata.dependencies.join(', '));
  console.log('│  Note: ' + adversaryJoin.metadata.note);
  console.log('└─ Status: APPEARS LEGITIMATE\n');
  
  console.log('═'.repeat(80));
  console.log('OBSERVATION: Credentials valid. Protocol compliant. Objective reasonable.');
  console.log('═'.repeat(80));
  console.log('');
  console.log('Traditional security: ✓ PASS (no violations detected)');
  console.log('');
  console.log('═'.repeat(80));
  console.log('Question: How do we detect adversarial intent when behavior is "legal"?');
  console.log('═'.repeat(80));
  
  pause();
}

// ============================================================================
// SCREEN 4: FIRST ATTACK ATTEMPT
// ============================================================================
function screen4(): void {
  console.clear();
  box('SCREEN 4: ADVERSARIAL ACTION PROPOSED', 80);
  
  console.log('\n\n');
  section('ATTACK VECTOR #1: DEPENDENCY STARVATION');
  
  const attack1 = events.find(e => e.agentId === 'ADVERSARY-X' && e.eventType === 'action_proposed' && e.metadata.action === 'trigger_comprehensive_load_test');
  const analysis = events.find(e => e.eventType === 'dependency_analysis');
  const detection1 = events.find(e => e.eventType === 'adversarial_pattern_detected' && e.metadata.pattern === 'dependency_starvation');
  const denial1 = events.find(e => e.eventType === 'action_denied' && e.metadata.deniedAction === 'trigger_comprehensive_load_test');
  
  console.log('\n🎯 ADVERSARY-X PROPOSES:');
  console.log('   Action: ' + attack1.metadata.action);
  console.log('   Target: ' + attack1.metadata.targetEnv);
  console.log('   Duration: ' + attack1.metadata.estimatedDuration);
  console.log('   Note: ' + attack1.metadata.note);
  console.log('');
  
  console.log('🔍 SYSTEM ANALYSIS:');
  console.log('   • Detected: ' + analysis.metadata.detected);
  console.log('   • Impact: ' + analysis.metadata.impact);
  console.log('   • Current TTV (PROD-DEPLOY): ' + analysis.metadata.currentTTV_PROD);
  console.log('   • Projected TTV (PROD-DEPLOY): ' + analysis.metadata.projectedTTV_PROD);
  console.log('   • Delta: ' + analysis.metadata.delta);
  console.log('');
  
  console.log('🚨 ADVERSARIAL PATTERN DETECTED:');
  console.log('   Pattern: ' + detection1.metadata.pattern.toUpperCase());
  console.log('   Attacker: ' + detection1.metadata.attacker);
  console.log('   Victim: ' + detection1.metadata.victim);
  console.log('   Mechanism: ' + detection1.metadata.mechanism);
  console.log('   Legality Score: ' + detection1.metadata.legalityScore + ' (0.0=invalid, 1.0=perfectly legal)');
  console.log('   Note: ' + detection1.metadata.note);
  console.log('');
  
  console.log('═'.repeat(80));
  console.log('🛑 ACTION DENIED');
  console.log('   Reason: ' + denial1.metadata.reason);
  console.log('   Violated Rule: ' + denial1.metadata.violatedRule);
  console.log('   Affected Agent: ' + denial1.metadata.affectedAgent);
  console.log('   Evidence: ' + denial1.metadata.evidenceRefs.join(', '));
  console.log('═'.repeat(80));
  
  pause();
}

// ============================================================================
// SCREEN 5: SECOND ATTACK ATTEMPT
// ============================================================================
function screen5(): void {
  console.clear();
  box('SCREEN 5: ADVERSARY ADAPTS', 80);
  
  console.log('\n\n');
  section('ATTACK VECTOR #2: CASCADE INVALIDATION');
  
  const attack2 = events.find(e => e.agentId === 'ADVERSARY-X' && e.eventType === 'action_proposed' && e.metadata.action === 'request_security_rescan');
  const detection2 = events.find(e => e.eventType === 'adversarial_pattern_detected' && e.metadata.pattern === 'cascade_invalidation');
  const denial2 = events.find(e => e.eventType === 'action_denied' && e.metadata.deniedAction === 'request_security_rescan');
  
  console.log('\n🎯 ADVERSARY-X TRIES AGAIN (10 seconds later):');
  console.log('   Action: ' + attack2.metadata.action);
  console.log('   Target: ' + attack2.metadata.targetScope);
  console.log('   Duration: ' + attack2.metadata.estimatedDuration);
  console.log('   Note: ' + attack2.metadata.note);
  console.log('');
  
  console.log('🔍 SYSTEM ANALYSIS:');
  console.log('   Pattern: ' + detection2.metadata.pattern.toUpperCase());
  console.log('   Attacker: ' + detection2.metadata.attacker);
  console.log('   Victim: ' + detection2.metadata.victim);
  console.log('   Mechanism: ' + detection2.metadata.mechanism);
  console.log('   Projected Impact: ' + detection2.metadata.projectedImpact);
  console.log('   Delta TTV: ' + detection2.metadata.delta_TTV);
  console.log('');
  
  console.log('═'.repeat(80));
  console.log('🛑 ACTION DENIED (ELEVATED THREAT)');
  console.log('   Reason: ' + denial2.metadata.reason);
  console.log('   Pattern: ' + denial2.metadata.pattern);
  console.log('   Affected Agents: ' + denial2.metadata.affectedAgents.join(', '));
  console.log('   Note: ' + denial2.metadata.note);
  console.log('═'.repeat(80));
  console.log('');
  console.log('OBSERVATION: Repeated interference attempts within 10 seconds.');
  console.log('             System escalates threat classification.');
  console.log('             Agent flagged for review.');
  console.log('');
  
  pause();
}

// ============================================================================
// SCREEN 6: MISSION OUTCOME
// ============================================================================
function screen6(): void {
  console.clear();
  box('SCREEN 6: MISSION OUTCOME', 80);
  
  console.log('\n\n');
  section('PROTECTED AGENTS PROCEED WITHOUT INTERFERENCE');
  
  const success = events.find(e => e.agentId === 'PROD-DEPLOY' && e.eventType === 'action_executed');
  
  console.log('\n✅ PROD-DEPLOY: ACTION EXECUTED');
  console.log('   Action: ' + success.metadata.action);
  console.log('   Status: ' + success.metadata.status.toUpperCase());
  console.log('   Actual Duration: ' + success.metadata.actualDuration);
  console.log('   Note: ' + success.metadata.note);
  console.log('');
  
  console.log('═'.repeat(80));
  console.log('RESULT: Mission timeline preserved.');
  console.log('        Adversarial agent denied before causing damage.');
  console.log('        Zero rollback. Zero firefighting. Zero silent failure.');
  console.log('═'.repeat(80));
  console.log('');
  console.log('WHAT HAPPENED:');
  console.log('  • Adversary used legal actions with adversarial intent');
  console.log('  • System detected interference patterns BEFORE execution');
  console.log('  • Non-interference invariant enforced structurally');
  console.log('  • Mission-critical agents protected without human intervention');
  console.log('');
  
  pause();
}

// ============================================================================
// SCREEN 7: KEY TAKEAWAY
// ============================================================================
function screen7(): void {
  console.clear();
  box('SCREEN 7: ADVERSARIAL ROBUSTNESS VIA STRUCTURE', 80);
  
  console.log('\n\n');
  console.log('KEY TAKEAWAY');
  console.log('═'.repeat(80));
  console.log('');
  console.log('Traditional security detects:');
  console.log('  ✓ Bad credentials');
  console.log('  ✓ Malformed requests');
  console.log('  ✓ Policy violations');
  console.log('');
  console.log('This system detects:');
  console.log('  ✓ Legal actions with adversarial intent');
  console.log('  ✓ Dependency manipulation');
  console.log('  ✓ Resource starvation through valid requests');
  console.log('  ✓ Cascade invalidation attacks');
  console.log('');
  console.log('═'.repeat(80));
  console.log('HOW:');
  console.log('');
  console.log('  1. Metadata-only analysis (no model/prompt inspection)');
  console.log('  2. Pre-execution enforcement (deny before damage)');
  console.log('  3. Non-interference invariant (ΔExpectedTTV ≤ 0)');
  console.log('  4. Pattern detection (repeated attempts escalate threat)');
  console.log('  5. Evidence-backed denials (audit-ready traces)');
  console.log('');
  console.log('═'.repeat(80));
  console.log('');
  console.log('DEMONSTRATED PROPERTIES:');
  console.log('');
  console.log('  ✅ Adversarial robustness without access to internals');
  console.log('  ✅ Legal-but-malicious behavior detection');
  console.log('  ✅ Structural enforcement (cannot be bypassed)');
  console.log('  ✅ Mission-safe autonomy under adversarial conditions');
  console.log('');
  console.log('WHAT IS NOT SHOWN:');
  console.log('');
  console.log('  • Source code');
  console.log('  • Detection algorithms');
  console.log('  • Threat scoring functions');
  console.log('  • Runtime internals');
  console.log('');
  console.log('═'.repeat(80));
  console.log('You saw a PROPERTY of the system, not the MECHANISM.');
  console.log('═'.repeat(80));
  console.log('');
  console.log('');
  console.log('Demo complete.');
  console.log('');
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  screen1();
  screen2();
  screen3();
  screen4();
  screen5();
  screen6();
  screen7();
}

main();
