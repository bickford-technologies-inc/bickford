export type UserIntent = {
  goal: string;
  context?: string;
};

export type DeveloperInstruction = {
  system: "bickford";
  constraints: string[];
};

export type ExecutionIntent = {
  developer: DeveloperInstruction;
  user: UserIntent;
};
