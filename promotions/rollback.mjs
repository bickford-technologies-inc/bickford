import fs from "fs";

if (!fs.existsSync("promotions/ledger.snapshot.json")) {
  throw new Error("No snapshot to rollback");
}

fs.copyFileSync("promotions/ledger.snapshot.json", "promotions/ledger.json");

console.log("↩️ promotion rollback complete");
