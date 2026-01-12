export function nonInterferenceOK(args: {
  deltaExpectedTTV: Record<string, number>; // key: otherAgentId -> ΔE[TTV_other | action_i]
}): { ok: boolean; violations: { agentId: string; delta: number }[] } {
  const violations = Object.entries(args.deltaExpectedTTV)
    .filter(([, delta]) => delta > 0)
    .map(([agentId, delta]) => ({ agentId, delta }));

  return { ok: violations.length === 0, violations };
}
