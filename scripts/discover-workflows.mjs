import fs from "fs";
import path from "path";
import { globSync } from "glob";

const DATALAKE_ROOT = path.join(process.cwd(), "datalake");
const MESSAGES_FILE = path.join(DATALAKE_ROOT, "messages.jsonl");
const WORKFLOWS_DIR = path.join(DATALAKE_ROOT, "workflows");

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function createWorkflowFromMessage(msg) {
  const keywords = msg.keywords || extractKeywords(msg.text);
  
  keywords.forEach(keyword => {
    const wfDir = path.join(WORKFLOWS_DIR, keyword);
    const metadataPath = path.join(wfDir, "metadata.json");
    
    if (!fs.existsSync(wfDir)) {
      fs.mkdirSync(wfDir, { recursive: true });
      
      const metadata = {
        workflow_id: keyword,
        name: `Workflow: ${keyword}`,
        keywords: [keyword],
        intents: [msg.text],
        constraints: [],
        authority_set: [],
        status: "draft",
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        version: "0.1.0",
        hash: ""
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`✅ Created workflow: ${keyword}`);
    }
  });
}

function discoverWorkflows() {
  console.log("🔍 Discovering workflows from messages...");
  
  if (!fs.existsSync(MESSAGES_FILE)) {
    console.log("No messages file found, skipping discovery");
    return;
  }
  
  const messages = fs.readFileSync(MESSAGES_FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
  
  messages.forEach(createWorkflowFromMessage);
  
  console.log(`✅ Processed ${messages.length} messages`);
}

discoverWorkflows();
