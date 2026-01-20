#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const INTERNAL_SCOPE = "@bickford/";
const FORBIDDEN_VERSION = "workspace:*";

function fail(msg) {
  console.error(`\n❌ [BICKFORD_WORKSPACE_VERSION_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

const packageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

const versionMap = new Map();
for (const pkgPath of packageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.name && pkg.version) {
    versionMap.set(pkg.name, pkg.version);
  }
}

for (const pkgPath of packageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const pkgName = pkg.name || pkgPath;

  const sections = {
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
    peerDependencies: pkg.peerDependencies,
  };

  for (const [sectionName, deps] of Object.entries(sections)) {
    if (!deps) continue;

    for (const [depName, version] of Object.entries(deps)) {
      if (!depName.startsWith(INTERNAL_SCOPE)) continue;

      if (version === FORBIDDEN_VERSION) {
        fail(
          `Package "${pkgName}" declares ${sectionName}:\n\n` +
            `  "${depName}": "${version}"\n\n` +
            `❌ workspace:* is no longer allowed for internal packages.\n` +
            `✔ Use the explicit version from the dependency package.\n`
        );
      }

      const expectedVersion = versionMap.get(depName);
      if (expectedVersion && version !== expectedVersion) {
        fail(
          `Package "${pkgName}" declares ${sectionName}:\n\n` +
            `  "${depName}": "${version}"\n\n` +
            `❌ Invalid internal version.\n` +
            `✔ Required: "${expectedVersion}"\n\n` +
            `Fix: replace the version with "${expectedVersion}".`
        );
      }
    }
  }
}

console.log("✅ All @bickford/* dependencies use explicit package versions");
