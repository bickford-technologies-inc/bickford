import fs from "fs";

const optr = fs.readFileSync("packages/types/src/optr.ts", "utf8");

if (!optr.includes("export type OptrResult")) {
  console.error("❌ Canon requires OptrResult to be exported from optr.ts");
  process.exit(1);
}

console.log("✅ OptrResult export present");
