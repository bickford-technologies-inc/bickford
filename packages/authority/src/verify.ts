import crypto from "node:crypto";
import fs from "node:fs";

const publicKeyPath = process.env.AUTHORITY_PUBLIC_KEY;

export function verifySignature(hash: string, signature: string): boolean {
  if (!publicKeyPath) {
    throw new Error("AUTHORITY_PUBLIC_KEY is required for verification.");
  }

  const publicKey = fs.readFileSync(publicKeyPath, "utf8");
  return crypto.verify(
    null,
    Buffer.from(hash),
    publicKey,
    Buffer.from(signature, "base64"),
  );
}
