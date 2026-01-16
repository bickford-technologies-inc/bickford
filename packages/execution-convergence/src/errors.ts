export class ConvergenceError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export class RefusalError extends ConvergenceError {
  constructor(message: string, code = "REFUSAL") {
    super(message, code);
  }
}
