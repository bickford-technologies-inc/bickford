import { BuildValidator } from "./validators/build-validator.js";
import { ESMValidator } from "./validators/esm-validator.js";
import { ExportValidator } from "./validators/export-validator.js";
import { NextJSValidator } from "./validators/nextjs-validator.js";
import { TypeScriptValidator } from "./validators/typescript-validator.js";
import { ScreenshotGenerator } from "./screenshot-generator.js";
import type { GeneratedFile, ValidationResult, ValidationSummary, Validator } from "./types.js";

export class IntentTranslationEngine {
  private readonly validators: Validator[];
  private readonly screenshotGenerator: ScreenshotGenerator;

  constructor(validators?: Validator[], screenshotGenerator = new ScreenshotGenerator()) {
    this.validators = validators ?? [
      new ESMValidator(),
      new ExportValidator(),
      new TypeScriptValidator(),
      new NextJSValidator(),
      new BuildValidator(),
    ];
    this.screenshotGenerator = screenshotGenerator;
  }

  async validate(files: GeneratedFile[]): Promise<ValidationSummary> {
    const results: ValidationResult[] = [];

    for (const validator of this.validators) {
      const result = await validator.validate(files);
      results.push(result);
    }

    const errors = results.flatMap((result) => result.errors ?? []);
    const valid = results.every((result) => result.valid);
    const screenshots = valid ? [] : await this.screenshotGenerator.generate(errors);

    return {
      valid,
      results,
      errors,
      screenshots,
    };
  }
}
