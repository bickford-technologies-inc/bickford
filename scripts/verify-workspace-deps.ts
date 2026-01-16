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
    if (name.startsWith("@bickford/") && (version as string) !== "workspace:*") {
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

function findRepoRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    try {
      if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) || 
          (fs.existsSync(path.join(dir, "package.json")) && 
           JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).workspaces)) {
        return dir;
      }
    } catch {
      // Continue searching if JSON parse fails
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const repoRoot = findRepoRoot();
scanDirectory(path.join(repoRoot, "packages"));
scanDirectory(path.join(repoRoot, "apps"));
