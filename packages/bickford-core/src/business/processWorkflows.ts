export type BusinessProcessWorkflow = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  valueUsd: number;
  cycleHours: number;
};

export function valuePerHourUsd(
  workflow: BusinessProcessWorkflow,
): number {
  if (!Number.isFinite(workflow.valueUsd) || !Number.isFinite(workflow.cycleHours)) {
    return 0;
  }
  if (workflow.cycleHours <= 0) {
    return 0;
  }
  return Number((workflow.valueUsd / workflow.cycleHours).toFixed(2));
}
