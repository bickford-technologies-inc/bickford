import fs from "fs";
import fs from "node:fs";
import path from "node:path";

const ROOT_TURBO = path.resolve(process.cwd(), "turbo.json");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (
      entry.name === "turbo.json" &&
      path.resolve(full) !== ROOT_TURBO
    ) {
      results.push(full);
    }
  }

  return results;
}

const bad = walk(process.cwd()).filter((file) => {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  return !Array.isArray(json.extends) || !json.extends.includes("//");
});

if (bad.length > 0) {
  console.error("❌ Invalid turbo.json files (missing extends //):");
  for (const file of bad) {
    console.error(" -", file);
  }
  process.exit(1);
}

console.log("✅ All non-root turbo.json files correctly extend root.");
