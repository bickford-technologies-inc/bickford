import type { GeneratedFile, ValidationResult } from "../types.js";

export class ESMValidator {
  readonly name = "esm";

  validate(files: GeneratedFile[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    for (const file of files) {
      const lines = file.content.split("\n");

      lines.forEach((line, index) => {
        const importMatch = line.match(/from\s+["'](\.[^"']+)["']/);
        if (importMatch) {
          const importPath = importMatch[1];
          const skipExtensions = [".json", ".css", ".scss", ".svg", ".png"];
          const shouldSkip = skipExtensions.some((ext) => importPath.endsWith(ext));

          if (!shouldSkip && !importPath.endsWith(".js")) {
            errors.push({
              type: "esm",
              file: file.path,
              line: index + 1,
              message: `Missing .js extension in import: ${importPath}`,
              suggestion: `Change to: from "${importPath}.js"`,
            });
          }
        }

        if (line.includes("require(") && !line.trim().startsWith("//")) {
          errors.push({
            type: "esm",
            file: file.path,
            line: index + 1,
            message: "CommonJS require() not allowed in ESM",
            suggestion: "Use import statement instead: import X from \"...\"",
          });
        }

        if (line.includes("module.exports") && !line.trim().startsWith("//")) {
          errors.push({
            type: "esm",
            file: file.path,
            line: index + 1,
            message: "CommonJS module.exports not allowed in ESM",
            suggestion: "Use export statement instead: export const X = ...",
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
