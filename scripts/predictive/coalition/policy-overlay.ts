export type PolicyOverlay = {
  nation: string;
  constraints: Array<{
    rule: string;
    stricterThanBaseline: boolean;
  }>;
};
