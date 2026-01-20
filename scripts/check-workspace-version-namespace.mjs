#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const WORKSPACE_VERSION = "workspace:*";

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

      fail(
        `Package "${pkgName}" declares ${sectionName}:\n\n` +
          `  "${depName}": "${version}"\n\n` +
          `❌ workspace:* is forbidden.\n` +
          `✔ Use an explicit semver range instead.\n`
      );
    }
  }
}

console.log("✅ workspace:* usage is not present in package.json files");
