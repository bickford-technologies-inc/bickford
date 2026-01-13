import fs from "fs";
import path from "path";

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) return walk(full);
    if (entry.name === "turbo.json" && full !== "turbo.json") return [full];
    return [];
  });
}

const bad = walk(process.cwd()).filter((file) => {
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  return !json.extends || !json.extends.includes("//");
});

if (bad.length) {
  console.error("❌ Invalid turbo.json files (missing extends //):");
  bad.forEach((f) => console.error(" -", f));
  process.exit(1);
}

console.log("✅ All turbo.json files correctly extend root.");
