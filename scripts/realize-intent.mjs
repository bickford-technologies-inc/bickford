import fs from "fs";
import path from "path";

const INTENT_PATH = path.resolve("intent.json");
const OUT_DIR = path.resolve(".bickford");

if (!fs.existsSync(INTENT_PATH)) process.exit(0);

const intent = JSON.parse(fs.readFileSync(INTENT_PATH, "utf8"));

fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(
  path.join(OUT_DIR, "REALIZED.json"),
  JSON.stringify(
    {
      intent,
      realized_at: new Date().toISOString(),
      build: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    },
    null,
    2,
  ),
);
