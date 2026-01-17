import fs from "fs";
import crypto from "crypto";
import Ajv from "ajv";

function sha256(p: string) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function hardFail(msg: string): never {
  console.error("HARD FAIL:", msg);
  process.exit(1);
}

// CONTRACT CHECK
if (!fs.existsSync("EXECUTION.contract.md"))
  hardFail("Missing execution contract");
const expected = fs.readFileSync("EXECUTION.contract.sha256", "utf8").trim();
if (sha256("EXECUTION.contract.md") !== expected)
  hardFail("Contract checksum mismatch");

// SURFACE CHECK
const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(
  fs.readFileSync("vercel.surface.schema.json", "utf8"),
);
const surface = JSON.parse(fs.readFileSync("vercel.surface.json", "utf8"));
if (!ajv.validate(schema, surface)) hardFail("Surface protocol invalid");

// MECHANICAL FIX WHITELIST
const fixes = JSON.parse(
  fs.readFileSync("mechanical.fixes.json", "utf8"),
).allowed;

// EXECUTION LOOP
function run() {
  // placeholder: invoke guards here
  // rerun from cursor if exists
  console.log("Executing under MAX-SAFE law");
}

run();
