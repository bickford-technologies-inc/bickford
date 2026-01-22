#!/usr/bin/env node

/**
 * Repository Inventory Script
 * 
 * Purpose: Discover and inventory all repositories for bickfordd-bit
 * This enables Milestone 1 of the Prime Architecture Initiative:
 * understanding what exists before consolidation.
 * 
 * Outputs: INVENTORY.md with structured data about all repos
 */

import { Octokit } from '@octokit/rest';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// GitHub API client setup
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = 'bickfordd-bit';

/**
 * Fetch all repositories for the user
 */
async function fetchRepositories() {
  console.log(`📦 Fetching repositories for ${OWNER}...`);
  
  try {
    const repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await octokit.repos.listForUser({
        username: OWNER,
        per_page: 100,
        page,
        sort: 'updated',
        direction: 'desc',
      });

      repos.push(...response.data);
      hasMore = response.data.length === 100;
      page++;
    }

    console.log(`✅ Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    console.error('❌ Error fetching repositories:', error.message);
    throw error;
  }
}

/**
 * Get detailed information for a single repository
 */
async function getRepoDetails(repo) {
  console.log(`  🔍 Analyzing ${repo.name}...`);
  
  const details = {
    name: repo.name,
    description: repo.description || '(no description)',
    visibility: repo.private ? 'private' : 'public',
    language: repo.language || 'unknown',
    languages: {},
    openIssues: repo.open_issues_count || 0,
    openPRs: 0,
    openPRDetails: [],
    workflows: [],
    keyDirs: [],
    hasReadme: false,
    readmeSnippet: '',
    lastCommit: repo.pushed_at || repo.updated_at,
    url: repo.html_url,
  };

  try {
    // Fetch language stats
    const langResponse = await octokit.repos.listLanguages({
      owner: OWNER,
      repo: repo.name,
    });
    details.languages = langResponse.data;

    // Count open PRs
    const openPRs = await octokit.paginate(octokit.pulls.list, {
      owner: OWNER,
      repo: repo.name,
      state: 'open',
      per_page: 100,
    });
    details.openPRs = openPRs.length;
    details.openPRDetails = openPRs.map(pr => ({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      updatedAt: pr.updated_at,
      author: pr.user?.login || 'unknown',
    }));

    // Check for workflow files
    try {
      const workflowsResponse = await octokit.repos.getContent({
        owner: OWNER,
        repo: repo.name,
        path: '.github/workflows',
      });
      
      if (Array.isArray(workflowsResponse.data)) {
        details.workflows = workflowsResponse.data
          .filter(f => f.name.endsWith('.yml') || f.name.endsWith('.yaml'))
          .map(f => f.name);
      }
    } catch (err) {
      // No workflows directory - that's OK
    }

    // Check for key directories
    const dirsToCheck = ['src', 'packages', 'docs', 'lib', 'app', 'scripts'];
    for (const dir of dirsToCheck) {
      try {
        await octokit.repos.getContent({
          owner: OWNER,
          repo: repo.name,
          path: dir,
        });
        details.keyDirs.push(dir);
      } catch (err) {
        // Directory doesn't exist - that's OK
      }
    }

    // Check for README
    try {
      const readmeResponse = await octokit.repos.getReadme({
        owner: OWNER,
        repo: repo.name,
      });
      
      if (readmeResponse.data.content) {
        const content = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
        details.hasReadme = true;
        details.readmeSnippet = content.substring(0, 500).replace(/\n/g, ' ');
      }
    } catch (err) {
      // No README - note this
    }

  } catch (error) {
    console.warn(`    ⚠️  Could not fetch all details for ${repo.name}: ${error.message}`);
  }

  return details;
}

/**
 * Format language stats as a readable string
 */
function formatLanguages(languages) {
  const entries = Object.entries(languages);
  if (entries.length === 0) return 'none';
  
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  const top3 = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang, bytes]) => {
      const pct = ((bytes / total) * 100).toFixed(0);
      return `${lang} (${pct}%)`;
    });
  
  return top3.join(', ');
}

/**
 * Format a date relative to now
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Generate the INVENTORY.md file
 */
function generateInventoryMarkdown(repoDetails) {
  const lines = [];
  
  lines.push('# Repository Inventory');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Owner**: ${OWNER}`);
  lines.push(`**Total Repositories**: ${repoDetails.length}`);
  lines.push('');
  
  // Summary table
  lines.push('## Summary Table');
  lines.push('');
  lines.push('| Repository | Languages | Issues | PRs | Workflows | Last Activity |');
  lines.push('|------------|-----------|--------|-----|-----------|---------------|');
  
  for (const repo of repoDetails) {
    const langs = formatLanguages(repo.languages);
    const workflows = repo.workflows.length || '—';
    const lastActivity = formatDate(repo.lastCommit);
    
    lines.push(`| [${repo.name}](${repo.url}) | ${langs} | ${repo.openIssues} | ${repo.openPRs} | ${workflows} | ${lastActivity} |`);
  }
  lines.push('');
  
  // Red flags section
  lines.push('## 🚩 Red Flags');
  lines.push('');
  
  const reposWithOpenPRs = repoDetails.filter(r => r.openPRs > 0);
  const reposWithoutReadme = repoDetails.filter(r => !r.hasReadme);
  const reposWithIssues = repoDetails.filter(r => r.openIssues > 0);
  const staleRepos = repoDetails.filter(r => {
    const days = (new Date() - new Date(r.lastCommit)) / (1000 * 60 * 60 * 24);
    return days > 180; // 6 months
  });
  
  if (reposWithOpenPRs.length > 0) {
    lines.push(`- **${reposWithOpenPRs.length} repositories have open PRs** (may need review before consolidation)`);
  }
  
  if (reposWithoutReadme.length > 0) {
    lines.push(`- **${reposWithoutReadme.length} repositories have no README** (documentation missing)`);
  }
  
  if (reposWithIssues.length > 0) {
    lines.push(`- **${reposWithIssues.length} repositories have open issues** (may contain valuable work items)`);
  }
  
  if (staleRepos.length > 0) {
    lines.push(`- **${staleRepos.length} repositories haven't been updated in 6+ months** (candidates for archival)`);
  }
  lines.push('');
  
  // Per-repo details
  lines.push('## Repository Details');
  lines.push('');
  
  for (const repo of repoDetails) {
    lines.push(`### ${repo.name}`);
    lines.push('');
    lines.push(`- **URL**: ${repo.url}`);
    lines.push(`- **Description**: ${repo.description}`);
    lines.push(`- **Visibility**: ${repo.visibility}`);
    lines.push(`- **Primary Language**: ${repo.language}`);
    lines.push(`- **All Languages**: ${formatLanguages(repo.languages)}`);
    lines.push(`- **Open Issues**: ${repo.openIssues}`);
    lines.push(`- **Open PRs**: ${repo.openPRs}`);
    if (repo.openPRDetails.length > 0) {
      const prLines = repo.openPRDetails
        .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
        .map(pr => `  - #${pr.number} ${pr.title} (by ${pr.author}, updated ${formatDate(pr.updatedAt)}) ${pr.url}`);
      lines.push('- **Open PR Details**:');
      lines.push(...prLines);
    }
    lines.push(`- **Workflows**: ${repo.workflows.length > 0 ? repo.workflows.join(', ') : 'none'}`);
    lines.push(`- **Key Directories**: ${repo.keyDirs.length > 0 ? repo.keyDirs.join(', ') : 'none'}`);
    lines.push(`- **Has README**: ${repo.hasReadme ? 'yes' : 'no'}`);
    lines.push(`- **Last Commit**: ${formatDate(repo.lastCommit)} (${repo.lastCommit})`);
    
    if (repo.hasReadme && repo.readmeSnippet) {
      lines.push(`- **README Snippet**: ${repo.readmeSnippet}...`);
    }
    
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🏗️  Prime Architecture Initiative - Milestone 1: Discovery\n');
  
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.error('   Set it to a GitHub personal access token or use in GitHub Actions');
    process.exit(1);
  }
  
  try {
    // Fetch all repositories
    const repos = await fetchRepositories();
    
    // Get detailed info for each repo (with rate limiting consideration)
    console.log('\n📊 Gathering detailed information...');
    const repoDetails = [];
    
    for (const repo of repos) {
      const details = await getRepoDetails(repo);
      repoDetails.push(details);
      
      // Brief delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Generate markdown
    console.log('\n📝 Generating INVENTORY.md...');
    const markdown = generateInventoryMarkdown(repoDetails);
    
    // Write to file
    const outputPath = join(process.cwd(), 'INVENTORY.md');
    writeFileSync(outputPath, markdown, 'utf-8');
    
    console.log(`\n✅ Inventory complete! Written to ${outputPath}`);
    console.log(`📊 Found ${repos.length} repositories`);
    console.log('\n🎯 Next steps:');
    console.log('   1. Review INVENTORY.md');
    console.log('   2. Identify repos to consolidate');
    console.log('   3. Run Milestone 2: Validation');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
