export type MaintenanceCOA = {
  coaId: string;
  description: string;
  predicted: {
    timeToReadiness: number;
    missionValueRecovered: number;
    cost: number;
    risk: number;
  };
  tradeoffs: string[];
};
