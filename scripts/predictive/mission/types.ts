export type MissionProfile = {
  missionId: string;
  window: { start: string; end: string };
  criticality: 1 | 2 | 3 | 4 | 5;
  requiredCapabilities: string[];
  valuePerHour: number;
};
