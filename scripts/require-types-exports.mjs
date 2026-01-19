import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("packages/types/package.json", "utf8"));

if (!pkg.exports || !pkg.exports["."]) {
  throw new Error("❌ @bickford/types must declare exports");
}

if (!pkg.exports["."].types || !pkg.exports["."].default) {
  throw new Error("❌ @bickford/types exports must include types + default");
}

console.log("✅ types exports valid");

const index = fs.readFileSync("packages/types/src/index.ts", "utf8");

if (index.includes("export * from") && index.includes("DeniedDecisionPayload")) {
  console.error(
    "❌ index.ts contains illegal re-exports inside a type boundary"
  );
  process.exit(1);
}
