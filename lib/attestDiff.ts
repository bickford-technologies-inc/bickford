import { canonicalize } from "./canonicalize";
import { merkleRoot } from "./merkle";

export function attestDiff(diffEntries: Record<string, unknown>[]) {
  const canonical = diffEntries.map(canonicalize);
  const root = merkleRoot(canonical);

  return {
    merkleRoot: root,
    leafCount: canonical.length,
    algorithm: "sha256",
  };
}
