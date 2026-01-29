import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DOCS_DIR = path.join(process.cwd(), "docs/technical");

async function main() {
  const files = await fs.readdir(DOCS_DIR);
  const mdFiles = files.filter((f) => /^[a-zA-Z0-9_.-]+\.md$/.test(f));
  if (mdFiles.length === 0) {
    throw new Error("No .md files found in docs/technical");
  }
  for (const file of mdFiles) {
    const filePath = path.join(DOCS_DIR, file);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const hash = crypto.createHash("sha256").update(content).digest("hex");
      console.log(`${file}: ${hash}`);
    } catch (err) {
      throw new Error(`Failed to read ${file}: ${err}`);
    }
  }
  console.log("All technical docs validated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
