export type GuardViolation = {
  id: string;
  description: string;
  fixable: boolean;
  autoFix?: (file: string) => string;
};
