import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error(`❌ Prisma invariant violated: ${msg}`);
  process.exit(1);
}

// 1. Exactly one schema
const schemas = execSync(`find . -name schema.prisma`, { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((p) => !p.includes("node_modules"));

if (schemas.length !== 1 || schemas[0] !== "./prisma/schema.prisma") {
  fail(
    `Expected exactly ./prisma/schema.prisma, found:\n${schemas.join("\n")}`
  );
}

// 2. No prisma generate outside root (ignore deps & docs)
const offenders = execSync(
  `grep -R "prisma generate" -n apps packages \
    --exclude-dir=node_modules \
    --exclude-dir=.turbo \
    --exclude-dir=.next \
    --exclude=README.md \
    --exclude=*.md \
    --exclude=package-lock.json \
    --exclude=pnpm-lock.yaml || true`,
  { encoding: "utf8" }
).trim();

if (offenders) {
  fail(`Forbidden prisma generate usage detected:\n${offenders}`);
}

// 3. Ensure ChatMessage exists in generated client
const clientPath = path.resolve("node_modules/.prisma/client/index.d.ts");
if (!fs.existsSync(clientPath)) {
  fail("Prisma client not generated");
}

const clientTypes = fs.readFileSync(clientPath, "utf8");
if (!clientTypes.includes("chatMessage:")) {
  fail("PrismaClient missing chatMessage — schema/client mismatch");
}

console.log("✅ Prisma singleton invariant satisfied");
