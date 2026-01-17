import crypto from "crypto";

export function hashArtifact(a: MaxArtifact) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(a))
    .digest("hex");
}
