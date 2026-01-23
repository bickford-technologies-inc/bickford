import crypto from "crypto";
import fs from "fs";

const ledgerPath = "ledger/design-lock.jsonl";
const surface = "bickford-web-chat";
const route = "/chat";
const files = ["app/chat/page.tsx", "app/chat/chat.module.css"];
const assertions = ["no-floating-ui", "full-page-chat-only", "no-mobile-ui-imports"];

function computeDesignHash(fileList) {
  const payload = fileList
    .map((file) => {
      const contents = fs.readFileSync(file, "utf8");
      return `# ${file}\n${contents}`;
    })
    .join("\n");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

const designHash = computeDesignHash(files);
const entry = {
  type: "design-lock",
  surface,
  route,
  design_hash: designHash,
  files,
  assertions,
  timestamp: new Date().toISOString(),
  authority: "BICKFORD::DESIGN_LOCK",
};

fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`);
console.log("Recorded design lock:", designHash);
