import crypto from "crypto";

export function attestCanon(payload: unknown) {
  const json = JSON.stringify(payload);
  return crypto.createHash("sha256").update(json).digest("hex");
}
