export type InvariantSignal = {
  invariantId: string;
  pressureScore: number;
  trendSlope: number;
};

export function predictFailure(s: InvariantSignal) {
  if (s.pressureScore > 0.8 && s.trendSlope > 0) {
    return { imminent: true, etaMs: 45_000 };
  }
  return { imminent: false };
}
