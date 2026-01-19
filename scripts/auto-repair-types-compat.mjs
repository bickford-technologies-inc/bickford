import fs from "node:fs";
import path from "node:path";

const indexPath = path.resolve("packages/types/src/index.ts");
const src = fs.readFileSync(indexPath, "utf8");

const forbidden = src
  .split("\n")
  .filter(
    (l) =>
      l.includes("export") && !l.includes("./canon") && !l.includes("./compat"),
  );

if (forbidden.length > 0) {
  throw new Error(
    `❌ index.ts may only export canon + compat.\n` +
      forbidden.map((l) => `  ${l}`).join("\n"),
  );
}

console.log("✅ types index surface valid");
