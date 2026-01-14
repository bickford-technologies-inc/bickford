export type MaintenancePlan = {
  actions: Array<{
    type: string;
    assetId: string;
    params: Record<string, any>;
  }>;
  predicted: {
    ttrHours: number;
    deltaReadiness: number;
    missionValueRecovered: number;
    risk: number;
    cost: number;
  };
  constraintsSatisfied: boolean;
};
