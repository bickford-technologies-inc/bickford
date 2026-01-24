import type { GeneratedFile, ValidationResult } from "../types.js";

export class ExportValidator {
  readonly name = "export";

  validate(files: GeneratedFile[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    for (const file of files) {
      if (!file.path.endsWith(".ts") || file.path.includes(".test.") || file.path.includes(".spec.")) {
        continue;
      }

      const lines = file.content.split("\n");

      lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("export ")) {
          return;
        }

        if (trimmed.match(/^interface\s+[A-Z]\w+/)) {
          errors.push({
            type: "export",
            file: file.path,
            line: index + 1,
            message: `Interface must be exported: ${trimmed}`,
            suggestion: `Add export keyword: export ${trimmed}`,
          });
        }

        if (trimmed.match(/^type\s+[A-Z]\w+/)) {
          errors.push({
            type: "export",
            file: file.path,
            line: index + 1,
            message: `Type must be exported: ${trimmed}`,
            suggestion: `Add export keyword: export ${trimmed}`,
          });
        }

        if (trimmed.match(/^enum\s+[A-Z]\w+/)) {
          errors.push({
            type: "export",
            file: file.path,
            line: index + 1,
            message: `Enum must be exported: ${trimmed}`,
            suggestion: `Add export keyword: export ${trimmed}`,
          });
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
