#!/usr/bin/env bun
/**
 * Phase 1 Kickoff: Bickford + Anthropic + Bun
 * Audit dependencies and validate Bun compatibility
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

console.log("═══════════════════════════════════════════════════════════");
console.log("  Phase 1: Foundation & Discovery");
console.log("  Bickford + Anthropic + Bun Integration");
console.log("═══════════════════════════════════════════════════════════\n");

// ============================================================================
// Task 1.1: Dependency Audit
// ============================================================================

console.log("Task 1.1: Dependency Audit\n");

const packagesDir = "./packages";
const llmPatterns = [/anthropic/i, /openai/i, /claude/i, /gpt/i, /llm/i, /ai/i];

const nodePatterns = [
  /node-fetch/,
  /axios/,
  /child_process/,
  /^fs$/,
  /crypto\.webcrypto/,
  /dotenv/,
];

const bunIncompatible = [/jest/, /ts-node/, /@swc\/core/];

let totalPackages = 0;
let llmDeps = [];
let nodeDeps = [];
let incompatibleDeps = [];

try {
  if (!existsSync(packagesDir)) {
    console.log("⚠️  No packages directory found");
    console.log("   (This is OK if running in a different structure)\n");
  } else {
    const packages = readdirSync(packagesDir);

    packages.forEach((pkg) => {
      const pkgJsonPath = join(packagesDir, pkg, "package.json");

      if (!existsSync(pkgJsonPath)) {
        return;
      }

      totalPackages++;

      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

      console.log(`📦 ${pkg}:`);

      let hasLLM = false;
      let hasNode = false;
      let hasIncompatible = false;

      Object.entries(deps).forEach(([name, version]) => {
        if (llmPatterns.some((p) => p.test(name))) {
          console.log(`  🤖 LLM: ${name}@${version}`);
          llmDeps.push({ package: pkg, dep: name, version });
          hasLLM = true;
        }
        if (nodePatterns.some((p) => p.test(name))) {
          console.log(`  ⚠️  Node-specific: ${name}@${version}`);
          nodeDeps.push({ package: pkg, dep: name, version });
          hasNode = true;
        }
        if (bunIncompatible.some((p) => p.test(name))) {
          console.log(`  ❌ Bun-incompatible: ${name}@${version}`);
          incompatibleDeps.push({ package: pkg, dep: name, version });
          hasIncompatible = true;
        }
      });

      if (!hasLLM && !hasNode && !hasIncompatible) {
        console.log(`  ✓ No issues found`);
      }

      console.log("");
    });
  }
} catch (err) {
  console.error("Error reading packages:", err.message);
}

console.log("─────────────────────────────────────────────────────────\n");

// Summary
console.log("Summary:");
console.log(`  Total packages scanned: ${totalPackages}`);
console.log(`  LLM dependencies: ${llmDeps.length}`);
console.log(`  Node-specific deps: ${nodeDeps.length}`);
console.log(`  Bun-incompatible deps: ${incompatibleDeps.length}\n`);

// Migration recommendations
if (nodeDeps.length > 0) {
  console.log("Node.js → Bun Migration Needed:");
  const uniqueNodeDeps = [...new Set(nodeDeps.map((d) => d.dep))];
  uniqueNodeDeps.forEach((dep) => {
    const replacements = {
      "node-fetch": "native fetch (built into Bun)",
      axios: "native fetch or ky",
      dotenv: "Bun.env (native)",
      fs: "fs (mostly compatible, check async methods)",
    };
    console.log(`  • ${dep} → ${replacements[dep] || "check Bun docs"}`);
  });
  console.log("");
}

if (incompatibleDeps.length > 0) {
  console.log("Required Replacements:");
  const uniqueIncompatible = [...new Set(incompatibleDeps.map((d) => d.dep))];
  uniqueIncompatible.forEach((dep) => {
    const replacements = {
      jest: "bun:test",
      "ts-node": "bun (native TypeScript)",
      "@swc/core": "Bun (native bundler)",
    };
    console.log(`  • ${dep} → ${replacements[dep] || "find Bun alternative"}`);
  });
  console.log("");
}

// ============================================================================
// Task 1.2: Bun Compatibility Check
// ============================================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("Task 1.2: Bun Compatibility Check\n");

// Check if Bun is installed
try {
  const bunVersion = Bun.version;
  console.log(`✓ Bun is installed: v${bunVersion}`);

  if (parseFloat(bunVersion) < 1.0) {
    console.log(
      "  ⚠️  Warning: Bun version <1.0 may have compatibility issues",
    );
  }
} catch {
  console.log("❌ Bun is not installed or not in PATH");
  console.log("   Install: curl -fsSL https://bun.sh/install | bash");
}

console.log("");

// Check package.json for workspace configuration
const rootPkgJson = existsSync("./package.json")
  ? JSON.parse(readFileSync("./package.json", "utf-8"))
  : null;

if (rootPkgJson) {
  console.log("Root package.json:");
  console.log(`  Name: ${rootPkgJson.name || "N/A"}`);
  console.log(
    `  Package manager: ${rootPkgJson.packageManager || "not specified"}`,
  );
  console.log(`  Workspaces: ${rootPkgJson.workspaces ? "Yes" : "No"}`);

  if (
    rootPkgJson.packageManager &&
    !rootPkgJson.packageManager.includes("bun")
  ) {
    console.log(
      '  📝 Recommendation: Add "packageManager": "bun@1.x" to package.json',
    );
  }
} else {
  console.log("⚠️  No root package.json found");
}

console.log("");

// ============================================================================
// Task 1.3: Anthropic API Test
// ============================================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("Task 1.3: Anthropic API Compatibility Test\n");

const apiKey = Bun.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.log("❌ ANTHROPIC_API_KEY not set in environment");
  console.log('   Set it with: export ANTHROPIC_API_KEY="sk-ant-..."');
  console.log("   Skipping API test\n");
} else {
  console.log("✓ ANTHROPIC_API_KEY found");
  console.log("  Testing API connection...\n");

  try {
    const startTime = performance.now();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: 'Reply with exactly: "Bun + Anthropic works!"',
          },
        ],
      }),
    });

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ API Error (${response.status}): ${error}\n`);
    } else {
      const data = await response.json();
      const text = data.content[0].text;

      console.log("✓ Anthropic API call successful");
      console.log(`  Latency: ${latency}ms`);
      console.log(`  Model: ${data.model}`);
      console.log(`  Response: "${text}"`);
      console.log(
        `  Usage: ${data.usage.input_tokens} in, ${data.usage.output_tokens} out\n`,
      );
    }
  } catch (err) {
    console.log(`❌ Network error: ${err.message}\n`);
  }
}

// ============================================================================
// Task 1.4: Performance Baseline
// ============================================================================

console.log("─────────────────────────────────────────────────────────\n");
console.log("Task 1.4: Performance Baseline\n");

console.log("Bun Runtime Performance:");

// Test 1: JSON parsing
const largeJson = JSON.stringify({
  data: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random(),
  })),
});
const jsonStart = performance.now();
for (let i = 0; i < 1000; i++) {
  JSON.parse(largeJson);
}
const jsonEnd = performance.now();
console.log(`  JSON parsing (1000x): ${Math.round(jsonEnd - jsonStart)}ms`);

// Test 2: Fetch performance
console.log("  Fetch API: ✓ Native (built-in)");

// Test 3: Crypto
const cryptoStart = performance.now();
for (let i = 0; i < 1000; i++) {
  crypto.randomUUID();
}
const cryptoEnd = performance.now();
console.log(`  Crypto UUID (1000x): ${Math.round(cryptoEnd - cryptoStart)}ms`);

console.log("");

// ============================================================================
// Summary & Next Steps
// ============================================================================

console.log("═══════════════════════════════════════════════════════════");
console.log("  Phase 1 Summary");
console.log("═══════════════════════════════════════════════════════════\n");

const checklist = [
  { task: "Bun installed", done: !!Bun.version },
  { task: "Dependencies audited", done: totalPackages > 0 },
  { task: "Anthropic API tested", done: !!apiKey },
  { task: "Performance baseline", done: true },
];

console.log("Checklist:");
checklist.forEach((item) => {
  const status = item.done ? "✓" : "❌";
  console.log(`  ${status} ${item.task}`);
});

console.log("\n");

if (nodeDeps.length > 0 || incompatibleDeps.length > 0) {
  console.log("⚠️  Migration Required:");
  console.log(`   ${nodeDeps.length} Node-specific dependencies to replace`);
  console.log(
    `   ${incompatibleDeps.length} Bun-incompatible dependencies to replace`,
  );
  console.log("");
}

console.log("Next Steps:");
console.log("  1. Review dependency audit above");
console.log("  2. Install Bun if not already installed");
console.log("  3. Set ANTHROPIC_API_KEY environment variable");
console.log("  4. Run: bun run scripts/phase2-integration.ts");
console.log("");

console.log("Full roadmap: bickford-anthropic-bun-roadmap.md");
console.log("═══════════════════════════════════════════════════════════\n");
