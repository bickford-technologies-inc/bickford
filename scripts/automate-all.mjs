import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const run = (cmd, opts = {}) => {
  console.log(`🤖 Executing: ${cmd}`);
  try {
    return execSync(cmd, { 
      stdio: "inherit", 
      encoding: "utf-8",
      ...opts 
    });
  } catch (error) {
    if (!opts.allowFail) throw error;
    console.warn(`⚠️ Command failed (continuing): ${cmd}`);
  }
};

async function automateAll() {
  console.log("🚀 Full Repo Automation Starting...\n");

  // 1. Install OpenCode if needed
  console.log("📦 Ensuring OpenCode is installed...");
  run("which opencode || npm install -g opencode-ai", { allowFail: true });

  // 2. Initialize OpenCode for project
  console.log("\n🧠 Initializing OpenCode agent...");
  if (!fs.existsSync("AGENTS.md")) {
    console.log("Run: opencode -> /init to generate AGENTS.md");
    console.log("Then commit and re-run this script");
    process.exit(0);
  }

  // 3. Build datalake infrastructure
  console.log("\n🗄️ Building datalake infrastructure...");
  run("node scripts/build-datalake-index.mjs");

  // 4. Run all prebuild checks
  console.log("\n🛡️ Running canon/OPTR enforcement...");
  run("pnpm run prebuild");

  // 5. Build types and packages
  console.log("\n🔨 Building workspace...");
  run("pnpm run build:types");
  run("pnpm run build");

  // 6. Update design locks
  console.log("\n🎨 Recording design state...");
  run("node scripts/record-design-lock.mjs");

  // 7. Run automated workflow discovery
  console.log("\n🔍 Running workflow discovery...");
  run("node scripts/discover-workflows.mjs");

  // 8. Commit automation artifacts
  console.log("\n💾 Committing automation state...");
  run("git add .");
  run('git commit -m "chore(automation): full repo automation run" || true', { allowFail: true });

  // 9. Deploy
  console.log("\n🚀 Deploying...");
  run("vercel --prod");

  console.log("\n✅ Full automation complete!");
}

automateAll().catch(console.error);
