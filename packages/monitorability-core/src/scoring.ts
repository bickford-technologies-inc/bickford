export function computeGMeanSquared(tpr: number, tnr: number): number {
  if (tpr < 0 || tpr > 1 || tnr < 0 || tnr > 1) {
    throw new Error("TPR/TNR must be in [0,1]");
  }
  return Math.sqrt(tpr * tnr);
}
