export type PartAvailability = {
  partNumber: string;
  location: string;
  onHand: number;
  dueIn: Array<{ date: string; qty: number }>;
  leadTimeDays: number;
  criticality: "LOW" | "MEDIUM" | "HIGH";
};
