import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

// Remove all generated Prisma artifacts
const prismaPaths = [
  resolve("node_modules/.prisma"),
  resolve("node_modules/@prisma/client"),
];

for (const path of prismaPaths) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

console.log("✅ Removed old Prisma generated files");

// Reinstall dependencies and regenerate client
execSync("bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile", { stdio: "inherit" });
execSync("pnpm prisma generate --schema=prisma/schema.prisma", {
  stdio: "inherit",
});
execSync("pnpm run build", { stdio: "inherit" });

console.log("⏳ Checking TypeScript types...");
try {
  execSync("pnpm tsc --noEmit", { stdio: "inherit" });
  console.log("✅ TypeScript type check passed");
} catch {
  console.log("❌ TypeScript type check failed");
  process.exit(1);
}

console.log("⏳ Running Lint...");
try {
  execSync("pnpm run lint", { stdio: "inherit" });
  console.log("✅ Lint passed");
} catch {
  console.log("❌ Lint failed");
  process.exit(1);
}

console.log("⏳ Running Tests...");
try {
  execSync("pnpm test", { stdio: "inherit" });
  console.log("✅ All tests passed");
} catch {
  console.log("❌ Tests failed");
  process.exit(1);
}

console.log("✅ Prisma, workspace sync, type, lint, test: complete");
