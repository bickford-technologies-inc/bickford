import { createHash } from "crypto";
import Ajv from "ajv";

async function sha256(path: string): Promise<string> {
  const file = Bun.file(path);
  const buffer = await file.arrayBuffer();
  return createHash("sha256").update(new Uint8Array(buffer)).digest("hex");
}

function hardFail(msg: string): never {
  process.exit(1);
}

async function init() {
  const contractFile = Bun.file("EXECUTION.contract.md");
  if (!(await contractFile.exists())) hardFail("Missing execution contract");

  const expectedFile = Bun.file("EXECUTION.contract.sha256");
  const expected = (await expectedFile.text()).trim();
  if ((await sha256("EXECUTION.contract.md")) !== expected)
    hardFail("Contract checksum mismatch");

  const ajv = new Ajv({ allErrors: true });
  const schemaFile = Bun.file("vercel.surface.schema.json");
  const schema = await schemaFile.json();
  const surfaceFile = Bun.file("vercel.surface.json");
  const surface = await surfaceFile.json();
  if (!ajv.validate(schema, surface)) hardFail("Surface protocol invalid");

  const fixesFile = Bun.file("mechanical.fixes.json");
  const fixes = (await fixesFile.json()).allowed;
}

function run() {}

init().catch(() => process.exit(1));
