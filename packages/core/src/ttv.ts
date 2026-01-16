export interface TTVSnapshot {
  baselineSeconds: number;
  realizedSeconds: number;
}

export function ttvDelta(snapshot: TTVSnapshot): number {
  return snapshot.baselineSeconds - snapshot.realizedSeconds;
}

export interface ValueReport {
  executionHash: string;
  ttvSecondsRecovered: number;
  estimatedDollarValue: number;
}
