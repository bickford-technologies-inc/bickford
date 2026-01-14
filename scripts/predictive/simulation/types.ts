export type Scenario = {
  assumptions: {
    supplyDelay?: number;
    surgeOps?: boolean;
    depotOutage?: boolean;
  };
  horizonDays: number;
};
