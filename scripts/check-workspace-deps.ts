import fs from "fs";
import path from "path";

function check(pkgPath: string) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  for (const [name, version] of Object.entries(deps || {})) {
    if (name.startsWith("@bickford/")) {
      if (!String(version).startsWith("workspace:")) {
        throw new Error(
          `[WORKSPACE_INVARIANT] ${pkg.name} depends on ${name}@${version}. Use workspace:<exact>.`
        );
      }
    }
  }
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules") continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full);
    if (entry === "package.json") check(full);
  }
}

walk(process.cwd());
console.log("✔ workspace dependency invariants satisfied");
