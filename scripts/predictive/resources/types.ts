export type Resource = {
  resourceId: string;
  type: "LABOR" | "BAY" | "TEST_SET" | "DEPOT_LINE";
  qualification?: string;
  capacityPerDay: number;
  location: string;
  availability: Array<{ start: string; end: string }>;
};
