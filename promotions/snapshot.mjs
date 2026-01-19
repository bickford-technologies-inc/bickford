import fs from "fs";

fs.copyFileSync("promotions/ledger.json", "promotions/ledger.snapshot.json");

console.log("📸 promotion snapshot saved");
