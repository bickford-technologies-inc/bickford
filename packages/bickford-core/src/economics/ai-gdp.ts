export type ValueEvent = {
  recoveredMs: number;
  costUsd: number;
};

export function aiGDP(events: ValueEvent[]) {
  const totalRecoveredMs = events.reduce((s, e) => s + e.recoveredMs, 0);
  const totalCost = events.reduce((s, e) => s + e.costUsd, 0);

  return {
    aiGdpMs: totalRecoveredMs,
    aiGdpUsd: Number(((totalRecoveredMs / 3_600_000) * 100).toFixed(2)),
    roi: Number(
      (((totalRecoveredMs / 3_600_000) * 100) / totalCost).toFixed(2),
    ),
  };
}
