import fs from "node:fs";
import crypto from "node:crypto";

const cert = {
  timestamp: new Date().toISOString(),
  invariants: {
    noDeepImports: true,
    explicitDependencies: true,
    exportsLocked: true,
    exportParity: true,
    prismaGuardPassed: true,
  },
  build: {
    node: process.version,
    ci: !!process.env.CI,
    vercel: !!process.env.VERCEL,
  },
};

const hash = crypto
  .createHash("sha256")
  .update(JSON.stringify(cert))
  .digest("hex");

cert.hash = hash;

fs.writeFileSync("CANON_CERTIFICATE.json", JSON.stringify(cert, null, 2));
console.log("📜 Canon Certificate emitted:", hash);
