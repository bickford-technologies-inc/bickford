import crypto from "crypto";
import fs from "fs";

const ledgerPath = "ledger/design-lock.jsonl";

function computeDesignHash(files) {
  const payload = files
    .map((file) => {
      const contents = fs.readFileSync(file, "utf8");
      return `# ${file}\n${contents}`;
    })
    .join("\n");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

const ledger = fs.readFileSync(ledgerPath, "utf8");
const entries = ledger
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line))
  .filter(
    (item) =>
      item.type === "design-lock" && item.surface === "bickford-web-chat",
  );
const entry = entries.at(-1);

if (!entry) {
  throw new Error(
    `Missing design-lock entry for bickford-web-chat in ${ledgerPath}`,
  );
}

const files = entry.files ?? ["app/chat/page.tsx", "app/chat/chat.module.css"];
const hash = computeDesignHash(files);

if (hash !== entry.design_hash) {
  throw new Error(
    `Design hash mismatch for ${files.join(", ")}. Expected ${entry.design_hash}, got ${hash}.`,
  );
}

console.log("Design lock verified:", hash);
