#!/usr/bin/env node

/**
 * CI Guard: Detect and fail on deep cross-package imports
 * 
 * This script ensures that all cross-package imports use only the public API
 * (package root) and never reach into /src/ or /dist/ subdirectories.
 * 
 * Violations indicate a breach of the dist-only canon boundary enforcement.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(process.cwd());

function main() {
  console.log('[check-no-deep-imports] Scanning for deep cross-package imports...\n');

  // Search for imports like @bickford/.*/src/ or @bickford/.*/dist/
  const searchDirs = ['packages', 'apps', 'demo'];
  const violations = [];

  for (const dir of searchDirs) {
    const fullPath = path.join(REPO_ROOT, dir);
    if (!existsSync(fullPath)) {
      console.log(`[check-no-deep-imports] Skipping ${dir} (not found)`);
      continue;
    }

    try {
      // Use grep to find violations
      // Pattern: from ["']@bickford/[package-name]/(src|dist)/
      const result = execSync(
        `grep -rn --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ` +
        `-E '@bickford/[^"'"'"']*/(src|dist)/' "${fullPath}" || true`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      if (result.trim()) {
        violations.push(...result.trim().split('\n'));
      }
    } catch (err) {
      // grep returns exit code 1 when no matches found (which is what we want)
      // Only fail on actual errors (exit code > 1)
      if (err.status && err.status > 1) {
        console.error(`[check-no-deep-imports] Error scanning ${dir}:`, err.message);
        process.exit(1);
      }
    }
  }

  if (violations.length > 0) {
    console.error('[check-no-deep-imports] ❌ FAILED: Found deep cross-package imports:\n');
    violations.forEach(v => console.error(`  ${v}`));
    console.error('\n[check-no-deep-imports] Deep imports violate dist-only canon boundaries.');
    console.error('[check-no-deep-imports] Use package root imports only (e.g., "@bickford/core").');
    console.error('[check-no-deep-imports] Ensure all public APIs are exported in src/index.ts.\n');
    process.exit(1);
  }

  console.log('[check-no-deep-imports] ✓ PASSED: No deep imports detected.\n');
  process.exit(0);
}

main();
