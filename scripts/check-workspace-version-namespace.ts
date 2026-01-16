#!/usr/bin/env ts-node

import fs from "fs";
import glob from "fast-glob";

const WORKSPACE_VERSION = "workspace:*";
const INTERNAL_SCOPE = "@bickford/";

function fail(msg) {
  console.error(`\n❌ [WORKSPACE_NAMESPACE_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

const packageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

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
      if (version !== WORKSPACE_VERSION) continue;

      if (!depName.startsWith(INTERNAL_SCOPE)) {
        fail(
          `Package "${pkgName}" declares ${sectionName}:\n\n` +
            `  "${depName}": "${version}"\n\n` +
            `❌ workspace:* is forbidden for non-${INTERNAL_SCOPE} packages.\n` +
            `✔ Only ${INTERNAL_SCOPE}* may use workspace linking.\n\n` +
            `Fix: replace "${version}" with an explicit semver range.`
        );
      }
    }
  }
}

console.log("✅ workspace:* usage is correctly restricted to @bickford/*");
