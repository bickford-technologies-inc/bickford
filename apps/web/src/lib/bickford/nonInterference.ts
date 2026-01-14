export function admissible(deltaTTVOtherAgents: number[]): boolean {
  return deltaTTVOtherAgents.every((d) => d <= 0);
}
