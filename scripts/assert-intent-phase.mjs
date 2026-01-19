import fs from "fs";

if (!fs.existsSync(".bickford")) {
  console.error("ERROR: Intent realization phase was skipped or removed.");
  process.exit(1);
}
