// Bun/Node cross-runtime script for integrating OPTR ledger with customer workflow

export async function recordCustomerDecision(customer: string, action: string) {
  // Detect runtime and select file APIs
  let readTextFile: (path: string) => Promise<string>;
  let writeTextFile: (path: string, content: string) => Promise<void>;

  if (typeof Bun !== "undefined") {
    readTextFile = async (path) => await Bun.file(path).text();
    writeTextFile = async (path, content) => {
      await Bun.write(path, content);
    };
  } else {
    // Node.js: use require for fs/promises
    const fs = require("fs/promises");
    readTextFile = async (path) => await fs.readFile(path, "utf8");
    writeTextFile = async (path, content) => {
      await fs.writeFile(path, content, "utf8");
    };
  }

  // Append a new event to the OPTR ledger
  const ledgerPath = "./bickford-optr/production_ledger.jsonl";
  const ledgerText = await readTextFile(ledgerPath);
  const ledger = ledgerText
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const previousHash = ledger.length
    ? ledger[ledger.length - 1].currentHash
    : "0".repeat(64);
  const timestamp = new Date().toISOString();
  const event = {
    timestamp,
    event: "customer_decision",
    payload: { customer, action },
    previousHash,
    currentHash: "",
  };
  const hashInput =
    previousHash +
    JSON.stringify({
      timestamp,
      event: "customer_decision",
      payload: { customer, action },
    });
  const { createHash } = require("crypto");
  event.currentHash = createHash("sha256").update(hashInput).digest("hex");
  ledger.push(event);
  await writeTextFile(
    ledgerPath,
    ledger.map((e) => JSON.stringify(e)).join("\n"),
  );
  console.log(`Recorded decision for ${customer}: ${action}`);
}
