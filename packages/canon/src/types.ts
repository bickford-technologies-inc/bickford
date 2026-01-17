export type CanonLevel = "SYSTEM" | "PACKAGE" | "MODULE" | "FILE";

export interface CanonItemBase {
  id: string;
  level: CanonLevel;
  description: string;
}

export interface ExecutionResult {
  success: boolean;
  reason?: string;
}
