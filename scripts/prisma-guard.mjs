#!/usr/bin/env node
/**
 * Prisma Guard - CI Guard for Prisma Invariant Enforcement
 * 
 * Ensures:
 * 1. Single canonical schema at /prisma/schema.prisma
 * 2. Prisma Client is generated before build
 * 3. No multiple schema files exist
 * 4. Schema is valid and parseable
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const CANONICAL_SCHEMA = "prisma/schema.prisma";
const PROJECT_ROOT = process.cwd();

function log(level, message) {
  const prefix = {
    error: `${RED}[PRISMA-GUARD ERROR]${RESET}`,
    success: `${GREEN}[PRISMA-GUARD OK]${RESET}`,
    warn: `${YELLOW}[PRISMA-GUARD WARN]${RESET}`,
    info: "[PRISMA-GUARD]",
  };
  console.log(`${prefix[level]} ${message}`);
}

function findAllPrismaSchemas(dir, schemas = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (file === "node_modules" || file === ".git" || file === "dist") {
        continue;
      }
      findAllPrismaSchemas(fullPath, schemas);
    } else if (file === "schema.prisma") {
      schemas.push(relative(PROJECT_ROOT, fullPath));
    }
  }

  return schemas;
}

function checkCanonicalSchema() {
  log("info", "Checking canonical schema...");

  const canonicalPath = join(PROJECT_ROOT, CANONICAL_SCHEMA);
  if (!existsSync(canonicalPath)) {
    log("error", `Canonical schema not found at ${CANONICAL_SCHEMA}`);
    process.exit(1);
  }

  log("success", `Canonical schema exists at ${CANONICAL_SCHEMA}`);
}

function checkNoMultipleSchemas() {
  log("info", "Checking for multiple schema files...");

  const schemas = findAllPrismaSchemas(PROJECT_ROOT);

  if (schemas.length > 1) {
    log("error", `Found ${schemas.length} schema files:`);
    schemas.forEach((s) => console.log(`  - ${s}`));
    log("error", "INVARIANT VIOLATION: Only one canonical schema allowed at /prisma/schema.prisma");
    process.exit(1);
  }

  log("success", "Single schema file confirmed");
}

function checkSchemaValid() {
  log("info", "Validating schema syntax...");

  try {
    execSync("npx prisma validate", {
      cwd: PROJECT_ROOT,
      stdio: "pipe",
    });
    log("success", "Schema is valid");
  } catch (error) {
    log("error", "Schema validation failed");
    console.error(error.stderr?.toString());
    process.exit(1);
  }
}

function checkPrismaGenerated() {
  log("info", "Checking Prisma Client generation...");

  const prismaClientPath = join(PROJECT_ROOT, "node_modules/.prisma/client");
  if (!existsSync(prismaClientPath)) {
    log("error", "Prisma Client not generated. Run 'npm run prisma:generate' first.");
    process.exit(1);
  }

  log("success", "Prisma Client is generated");
}

function checkSchemaOutput() {
  log("info", "Checking schema output configuration...");

  const schemaContent = readFileSync(
    join(PROJECT_ROOT, CANONICAL_SCHEMA),
    "utf-8"
  );

  // Normalize whitespace for comparison
  const normalizedContent = schemaContent.replace(/\s+/g, ' ');
  const expectedOutput = 'output = "../node_modules/.prisma/client"'.replace(/\s+/g, ' ');

  if (!normalizedContent.includes(expectedOutput)) {
    log(
      "warn",
      "Schema should specify output path: output = \"../node_modules/.prisma/client\""
    );
  } else {
    log("success", "Schema output configuration is correct");
  }
}

function main() {
  console.log("\n🔒 Prisma Guard - Enforcing Prisma Invariants\n");

  checkCanonicalSchema();
  checkNoMultipleSchemas();
  checkSchemaValid();
  checkSchemaOutput();
  checkPrismaGenerated();

  console.log(`\n${GREEN}✓ All Prisma invariants satisfied${RESET}\n`);
}

main();
