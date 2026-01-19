export type PatchResult = {
  testsPass: boolean;
  blastRadiusReduced: boolean;
};

export function autoMerge(r: PatchResult) {
  if (r.testsPass && r.blastRadiusReduced) {
    return { merged: true, ts: new Date().toISOString() };
  }
  return { merged: false };
}
