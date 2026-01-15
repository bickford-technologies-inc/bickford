import fs from "fs";
import path from "path";

function checkPackageJson(pkgPath: string): void {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  for (const [name, version] of Object.entries(allDeps || {})) {
    if (name.startsWith("@bickford/") && version !== "workspace:*") {
      process.exit(1);
    }
  }
}

function scanDirectory(dir: string): void {
  if (!fs.existsSync(dir)) return;
  
  for (const entry of fs.readdirSync(dir)) {
    if (entry === "node_modules") continue;
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry === "package.json") {
      checkPackageJson(fullPath);
    }
  }
}

const repoRoot = process.cwd();
scanDirectory(path.join(repoRoot, "packages"));
scanDirectory(path.join(repoRoot, "apps"));
