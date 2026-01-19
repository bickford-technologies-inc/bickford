export type MarketAction = {
  marketShareDelta: number;
  exclusivity: boolean;
};

export function antitrustCheck(a: MarketAction) {
  if (a.marketShareDelta > 0.2 || a.exclusivity) {
    return { allowed: false, reason: "ANTITRUST_RISK" };
  }
  return { allowed: true };
}
