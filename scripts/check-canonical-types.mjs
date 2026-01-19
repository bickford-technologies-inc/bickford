import fs from "fs";
import path from "path";

const TYPES_INDEX = "packages/types/src/index.ts";
const exportsText = fs.readFileSync(TYPES_INDEX, "utf8");

const exported = new Set(
  [...exportsText.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)].flatMap((m) =>
    m[2].split(",").map((s) => s.trim()),
  ),
);

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) scan(p);
    if (p.endsWith(".ts")) {
      const text = fs.readFileSync(p, "utf8");
      for (const m of text.matchAll(/from\s+["']@bickford\/types["']/g)) {
        const imports = [
          ...text.matchAll(
            /import\s+\{([^}]+)\}\s+from\s+["']@bickford\/types["']/g,
          ),
        ].flatMap((m) => m[1].split(",").map((s) => s.trim()));
        for (const i of imports) {
          if (!exported.has(i)) {
            console.error(
              `❌ CANON VIOLATION: ${i} not exported by @bickford/types`,
            );
            process.exit(1);
          }
        }
      }
    }
  }
}

scan("packages");
console.log("✅ canonical type imports validated");
