import { execSync } from "child_process";

const output = execSync("pnpm -w list --depth 0", {
  encoding: "utf8",
});

const REQUIRED = [
  "@bickford/core",
  "@bickford/types",
  "@bickford/authority",
  "@bickford/canon",
  "@bickford/optr",
];

for (const pkg of REQUIRED) {
  if (output.includes(pkg)) continue;
  console.warn(`⚠️ Workspace package missing: ${pkg}`);
}

console.log("✅ Workspace check complete");
