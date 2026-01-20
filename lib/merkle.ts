import crypto from "crypto";

export function hash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return hash("");
  let level = leaves.map(hash);

  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(hash(left + right));
    }
    level = next;
  }
  return level[0];
}
