import crypto from "crypto";
import fs from "fs";

const ledgerPath = "ledger/design-lock.jsonl";
const cssPath = "app/chat/chat.module.css";

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
  throw new Error(`Missing design-lock entry for bickford-web-chat in ${ledgerPath}`);
}

const css = fs.readFileSync(cssPath, "utf8");
const hash = crypto.createHash("sha256").update(css).digest("hex");

if (hash !== entry.design_hash) {
  throw new Error(
    `Design hash mismatch for ${cssPath}. Expected ${entry.design_hash}, got ${hash}.`,
  );
}

console.log("Design lock verified:", hash);
