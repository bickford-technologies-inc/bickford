import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const REPO_ROOT = process.cwd();
const BLOCKED = [
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vscode",
  ".DS_Store",
  "out",
  "dist",
  "coverage",
  ".nyc_output",
  ".env",
  ".env.local",
  ".env.example",
  ".env.*.example",
];

async function walk(dir: string, rel = ""): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    if (BLOCKED.some((b) => entry.name === b || entry.name.startsWith(b)))
      continue;
    const full = path.join(dir, entry.name);
    const relative = path.join(rel, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await walk(full, relative));
    } else {
      files.push(relative);
    }
  }
  return files;
}

async function main() {
  const files = await walk(REPO_ROOT);
  if (files.length === 0) throw new Error("No files found in repo");
  for (const file of files) {
    const filePath = path.join(REPO_ROOT, file);
    try {
      const content = await fs.readFile(filePath);
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      console.log(`${file}: ${hash}`);
    } catch (err) {
      throw new Error(`Failed to read ${file}: ${err}`);
    }
  }
  console.log("All repo files validated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
