export type GeneratedFile = {
  path: string;
  content: string;
};

export type ValidationError = {
  type: string;
  file: string;
  line: number;
  message: string;
  suggestion: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  output?: string;
};

export type ValidationSummary = {
  valid: boolean;
  results: ValidationResult[];
  errors: ValidationError[];
  screenshots: string[];
};

export type Validator = {
  name: string;
  validate(files: GeneratedFile[]): ValidationResult | Promise<ValidationResult>;
};
