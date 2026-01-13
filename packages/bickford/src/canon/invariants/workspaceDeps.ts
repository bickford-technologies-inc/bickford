/**
 * Canon Invariant: Workspace Dependency Truth
 * TIMESTAMP: 2026-01-12T22:45:00-05:00
 *
 * A Canon package may not import a workspace module
 * that is not explicitly declared in its package.json.
 */

import fs from "fs";
import path from "path";

export function assertWorkspaceDeps(pkgDir: string, imports: string[]) {
  const pkgPath = path.join(pkgDir, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const declared = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const imp of imports) {
    if (imp.startsWith("@bickford/") && !declared?.[imp]) {
      throw new Error(
        `CANON INVARIANT VIOLATION: ${pkg.name} imports ${imp} without declaring it`
      );
    }
  }
}
