import fs from "fs";

if (!process.env.VERCEL) {
  process.exit(0);
}

if (!fs.existsSync("intent.json")) {
  process.exit(0);
}

process.exit(0);
