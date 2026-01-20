import crypto from "node:crypto";
import fs from "node:fs";

const privateKeyPath = process.env.AUTHORITY_PRIVATE_KEY;

export function signHash(hash: string): string {
  if (!privateKeyPath) {
    throw new Error("AUTHORITY_PRIVATE_KEY is required for signing.");
  }

  const privateKey = fs.readFileSync(privateKeyPath, "utf8");
  const signature = crypto.sign(null, Buffer.from(hash), privateKey);
  return signature.toString("base64");
}
