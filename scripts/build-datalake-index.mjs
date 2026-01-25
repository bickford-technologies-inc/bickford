import fs from "fs";
import path from "path";
import { globSync } from "glob";

const DATALAKE_ROOT = path.join(process.cwd(), "datalake");
const WORKFLOWS_DIR = path.join(DATALAKE_ROOT, "workflows");
const INDEX_FILE = path.join(DATALAKE_ROOT, "workflow_index.jsonl");

function buildIndex() {
  console.log("🔨 Building workflow index...");
  
  // Find all workflow metadata files
  const workflows = globSync(`${WORKFLOWS_DIR}/*/metadata.json`);
  
  const index = workflows.map(wfPath => {
    const metadata = JSON.parse(fs.readFileSync(wfPath, "utf8"));
    return {
      workflow_id: metadata.workflow_id,
      keywords: metadata.keywords || [],
      intents: metadata.intents || [],
      path: path.dirname(wfPath)
    };
  });

  // Write index
  fs.writeFileSync(
    INDEX_FILE,
    index.map(entry => JSON.stringify(entry)).join("\n")
  );

  console.log(`✅ Indexed ${index.length} workflows`);
}

buildIndex();
