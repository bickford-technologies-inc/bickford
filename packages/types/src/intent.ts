export type Intent = {
  id: string;
  action: string;
  timestamp?: number;
  authority?: string;
  metadata?: Record<string, unknown>;
};
