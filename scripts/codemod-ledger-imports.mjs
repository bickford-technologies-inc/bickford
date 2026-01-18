import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "packages/web-ui");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(entry.name)) patch(p);
  }
}

function patch(file) {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes("@/lib/ledger")) return;

  const out = src
    .replace(
      /from\s+["']@\/lib\/ledger\/fs-ledger\.node["']/g,
      `from "@bickford/ledger"`,
    )
    .replace(/from\s+["']@\/lib\/ledger["']/g, `from "@bickford/ledger"`);

  if (out !== src) {
    fs.writeFileSync(file, out);
    console.log("patched:", path.relative(process.cwd(), file));
  }
}

walk(ROOT);
