export type Patch = {
  id: string;
  blastRadiusReduction: number;
  confidence: number;
};

export function selectPatch(patches: Patch[]) {
  return patches
    .filter((p) => p.confidence > 0.9)
    .sort((a, b) => b.blastRadiusReduction - a.blastRadiusReduction)[0];
}
