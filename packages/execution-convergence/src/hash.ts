import * as crypto from "node:crypto";

export function hashArtifact(input: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}
