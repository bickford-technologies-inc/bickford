import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const workspace = new Set();

function collect(dir) {
  const pkg = path.join(dir, "package.json");
  if (fs.existsSync(pkg)) {
    const json = JSON.parse(fs.readFileSync(pkg, "utf8"));
    if (json.name?.startsWith("@bickford/")) {
      workspace.add(json.name);
    }
  }
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      e.isDirectory() &&
      !["node_modules", ".git", ".vercel"].includes(e.name)
    ) {
      collect(path.join(dir, e.name));
    }
  }
}

function check(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) check(p);

    if (e.name === "package.json") {
      const json = JSON.parse(fs.readFileSync(p, "utf8"));
      for (const field of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ]) {
        for (const dep of Object.keys(json[field] || {})) {
          if (dep.startsWith("@bickford/") && !workspace.has(dep)) {
            console.error(`❌ Phantom workspace dependency: ${dep} in ${p}`);
            process.exit(1);
          }
        }
      }
    }
  }
}

collect(ROOT);
check(ROOT);

console.log("✅ Workspace dependency graph is clean");
