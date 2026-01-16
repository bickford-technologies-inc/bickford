export type Persona = "CIO" | "ServiceOps" | "Engineering" | "Sales";

export interface DemoStep {
  id: string;
  title: string;
  category: string;
  description: string;
}

export interface DemoPlan {
  persona: Persona;
  intent: string;
  categories: string[];
  steps: DemoStep[];
}
