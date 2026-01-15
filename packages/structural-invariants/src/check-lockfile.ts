#!/usr/bin/env node
import { execSync } from "child_process";

export async function runCheckLockfile() {
  const diff = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

  const lockChanged = diff.includes("pnpm-lock.yaml");
  const pkgChanged = diff.some((f) => f.endsWith("package.json"));

  if (lockChanged && !pkgChanged) {
    console.error(
      "❌ pnpm-lock.yaml changed without a package.json change. Blocked."
    );
    process.exit(1);
  }
}
