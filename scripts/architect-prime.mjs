#!/usr/bin/env node

/**
 * Prime Architecture Orchestration Script
 * 
 * Purpose: Orchestrate the 5-milestone consolidation plan
 * Provides coaching-style updates and decision gates at each milestone
 * 
 * Milestones:
 * 1. Discovery & Inventory - Understand what exists
 * 2. Validation - Ensure no data loss, conflicts resolved
 * 3. Merge - Actually consolidate repositories
 * 4. Cleanup - Remove duplication, organize structure
 * 5. Deletion - Archive/delete source repositories
 */

import { Octokit } from '@octokit/rest';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// GitHub API client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = 'bickfordd-bit';
const REPO = 'session-completion-runtime';

/**
 * Post a comment to a tracking issue
 */
async function postIssueComment(issueNumber, message) {
  if (!issueNumber) {
    console.log('\n📝 Would post comment (no issue number provided):');
    console.log(message);
    return;
  }

  try {
    await octokit.issues.createComment({
      owner: OWNER,
      repo: REPO,
      issue_number: issueNumber,
      body: message,
    });
    console.log(`✅ Posted comment to issue #${issueNumber}`);
  } catch (error) {
    console.error(`⚠️  Could not post comment to issue #${issueNumber}:`, error.message);
  }
}

/**
 * Run a shell command and return the result
 */
function runCommand(command, args) {
  console.log(`  $ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });
  
  return result.status === 0;
}

/**
 * Milestone 1: Discovery & Inventory
 * Run the inventory script and report findings
 */
async function milestone1Discovery(issueNumber) {
  console.log('\n🏗️  MILESTONE 1: Discovery & Inventory');
  console.log('━'.repeat(60));
  console.log('\n📋 Goal: Understand what repositories exist and their state');
  console.log('🎯 Output: INVENTORY.md with structured data\n');
  
  // Run inventory script
  console.log('Running inventory script...');
  const success = runCommand('node', ['scripts/inventory-repos.mjs']);
  
  if (!success) {
    console.error('\n❌ Inventory script failed');
    await postIssueComment(issueNumber, 
      '## 🚨 Milestone 1 Failed\n\n' +
      'The inventory script encountered an error. Please check the logs and try again.\n\n' +
      '**Next steps:**\n' +
      '1. Review the error logs\n' +
      '2. Fix any API or authentication issues\n' +
      '3. Re-run the workflow'
    );
    return false;
  }
  
  // Check if INVENTORY.md was created
  if (!existsSync('INVENTORY.md')) {
    console.error('\n❌ INVENTORY.md was not created');
    return false;
  }
  
  console.log('\n✅ Milestone 1 complete!');
  console.log('📊 INVENTORY.md has been generated');
  
  // Post success comment
  await postIssueComment(issueNumber,
    '## ✅ Milestone 1: Discovery Complete\n\n' +
    '**What happened:**\n' +
    '- Scanned all repositories for @bickfordd-bit\n' +
    '- Extracted metadata (languages, issues, PRs, workflows)\n' +
    '- Generated `INVENTORY.md` with structured analysis\n\n' +
    '**What you need to do:**\n' +
    '1. Review `INVENTORY.md` in the PR\n' +
    '2. Identify any red flags (open PRs, missing docs, stale repos)\n' +
    '3. Decide which repositories should be consolidated\n' +
    '4. Merge this PR when ready\n\n' +
    '**Next milestone:** Validation (will check for conflicts and data loss risks)\n\n' +
    '💡 **Coaching note:** This is a discovery phase - no changes have been made yet. ' +
    'Take time to understand the landscape before moving forward.'
  );
  
  return true;
}

/**
 * Milestone 2: Validation (stub for future implementation)
 */
async function milestone2Validation(issueNumber) {
  console.log('\n🏗️  MILESTONE 2: Validation');
  console.log('━'.repeat(60));
  console.log('\n⚠️  This milestone is not yet implemented');
  console.log('📋 Planned capabilities:');
  console.log('   - Check for merge conflicts');
  console.log('   - Validate no data loss');
  console.log('   - Ensure all tests pass');
  console.log('   - Review dependencies for conflicts\n');
  
  await postIssueComment(issueNumber,
    '## 🚧 Milestone 2: Validation (Not Yet Implemented)\n\n' +
    '**Planned capabilities:**\n' +
    '- Clone and analyze source repositories\n' +
    '- Check for file path conflicts\n' +
    '- Validate dependency compatibility\n' +
    '- Run test suites to ensure nothing breaks\n\n' +
    '**Status:** Awaiting implementation in a future PR'
  );
  
  return false; // Not implemented
}

/**
 * Milestone 3: Merge (stub for future implementation)
 */
async function milestone3Merge(issueNumber) {
  console.log('\n🏗️  MILESTONE 3: Merge');
  console.log('━'.repeat(60));
  console.log('\n⚠️  This milestone is not yet implemented');
  console.log('📋 Planned capabilities:');
  console.log('   - Create merge strategy');
  console.log('   - Preserve git history');
  console.log('   - Merge repositories using git subtree');
  console.log('   - Update package configurations\n');
  
  await postIssueComment(issueNumber,
    '## 🚧 Milestone 3: Merge (Not Yet Implemented)\n\n' +
    '**Planned capabilities:**\n' +
    '- Use `git subtree` to merge repos with history preservation\n' +
    '- Reorganize into monorepo structure\n' +
    '- Update all references and imports\n' +
    '- Ensure builds and tests pass\n\n' +
    '**Status:** Awaiting implementation in a future PR'
  );
  
  return false; // Not implemented
}

/**
 * Milestone 4: Cleanup (stub for future implementation)
 */
async function milestone4Cleanup(issueNumber) {
  console.log('\n🏗️  MILESTONE 4: Cleanup');
  console.log('━'.repeat(60));
  console.log('\n⚠️  This milestone is not yet implemented');
  console.log('📋 Planned capabilities:');
  console.log('   - Remove duplicate code');
  console.log('   - Consolidate documentation');
  console.log('   - Optimize package structure');
  console.log('   - Update CI/CD pipelines\n');
  
  await postIssueComment(issueNumber,
    '## 🚧 Milestone 4: Cleanup (Not Yet Implemented)\n\n' +
    '**Planned capabilities:**\n' +
    '- Deduplicate code and dependencies\n' +
    '- Consolidate overlapping documentation\n' +
    '- Optimize directory structure\n' +
    '- Merge workflow files\n\n' +
    '**Status:** Awaiting implementation in a future PR'
  );
  
  return false; // Not implemented
}

/**
 * Milestone 5: Deletion (stub for future implementation)
 */
async function milestone5Deletion(issueNumber) {
  console.log('\n🏗️  MILESTONE 5: Deletion');
  console.log('━'.repeat(60));
  console.log('\n⚠️  This milestone is not yet implemented');
  console.log('📋 Planned capabilities:');
  console.log('   - Archive source repositories');
  console.log('   - Add deprecation notices');
  console.log('   - Update README files');
  console.log('   - Optionally delete archived repos\n');
  
  await postIssueComment(issueNumber,
    '## 🚧 Milestone 5: Deletion (Not Yet Implemented)\n\n' +
    '**Planned capabilities:**\n' +
    '- Archive source repositories (preserves history)\n' +
    '- Add deprecation notices pointing to prime repo\n' +
    '- Option to fully delete after confirmation period\n\n' +
    '**Status:** Awaiting implementation in a future PR\n\n' +
    '⚠️  **Safety note:** This is the final destructive step and will require explicit confirmation.'
  );
  
  return false; // Not implemented
}

/**
 * Main orchestration logic
 */
async function main() {
  console.log('🏗️  Prime Architecture Initiative');
  console.log('   Building the "prime infinite Bickford" repository\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const milestone = args[0] || '1';
  const issueNumber = args[1] ? parseInt(args[1]) : null;
  
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }
  
  console.log(`🎯 Running Milestone ${milestone}`);
  if (issueNumber) {
    console.log(`📍 Tracking issue: #${issueNumber}`);
  }
  console.log('');
  
  let success = false;
  
  // Run the appropriate milestone
  switch (milestone) {
    case '1':
      success = await milestone1Discovery(issueNumber);
      break;
    case '2':
      success = await milestone2Validation(issueNumber);
      break;
    case '3':
      success = await milestone3Merge(issueNumber);
      break;
    case '4':
      success = await milestone4Cleanup(issueNumber);
      break;
    case '5':
      success = await milestone5Deletion(issueNumber);
      break;
    default:
      console.error(`❌ Unknown milestone: ${milestone}`);
      console.error('   Valid milestones: 1, 2, 3, 4, 5');
      process.exit(1);
  }
  
  // Exit with appropriate status
  if (success) {
    console.log('\n✅ Milestone completed successfully\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Milestone did not complete (may not be implemented yet)\n');
    process.exit(milestone === '1' ? 1 : 0); // Only fail for milestone 1
  }
}

main();
