import { exec } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { GeneratedFile, ValidationError, ValidationResult } from "../types.js";

const execAsync = promisify(exec);

export class TypeScriptValidator {
  readonly name = "typescript";

  async validate(files: GeneratedFile[]): Promise<ValidationResult> {
    const tmpDir = path.join(os.tmpdir(), `ts-validation-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });

    try {
      for (const file of files) {
        const filePath = path.join(tmpDir, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content);
      }

      await fs.writeFile(
        path.join(tmpDir, "package.json"),
        JSON.stringify(
          {
            name: "temp-validation",
            type: "module",
            dependencies: {
              "@types/node": "^20.0.0",
              next: "^14.0.0",
              react: "^18.0.0",
            },
          },
          null,
          2,
        ),
      );

      await fs.writeFile(
        path.join(tmpDir, "tsconfig.json"),
        JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["ES2022", "DOM"],
              module: "ESNext",
              moduleResolution: "bundler",
              strict: true,
              noImplicitAny: true,
              strictNullChecks: true,
              strictFunctionTypes: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              jsx: "react-jsx",
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["node_modules"],
          },
          null,
          2,
        ),
      );

      const { stdout, stderr } = await execAsync(
        "npx -y typescript@latest tsc --noEmit --pretty",
        { cwd: tmpDir, timeout: 30000 },
      ).catch((error: { stdout?: string; stderr?: string }) => ({
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? "",
      }));

      const output = `${stdout}${stderr}`;
      const errors = this.parseTSCOutput(output);

      return {
        valid: errors.length === 0,
        errors,
        output,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private parseTSCOutput(output: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = output.split("\n");

    for (const line of lines) {
      const match = line.match(/(.+\.tsx?)\((\d+),\d+\):\s+error\s+TS(\d+):\s+(.+)/);
      if (match) {
        const [, file, lineNum, errorCode, message] = match;
        errors.push({
          type: "typescript",
          file,
          line: Number.parseInt(lineNum, 10),
          message: `TS${errorCode}: ${message}`,
          suggestion: this.getSuggestion(errorCode),
        });
      }
    }

    return errors;
  }

  private getSuggestion(errorCode: string): string {
    const suggestions: Record<string, string> = {
      "2307": "Add .js extension to import path",
      "2305": "Export the module member or import from correct source",
      "7016": "Add type annotation or install @types package",
      "2339": "Check property name spelling or add to interface",
      "2345": "Ensure argument types match function signature",
      "2322": "Ensure value type matches declared type",
      "2554": "Provide all required function arguments",
      "2304": "Import the name or check spelling",
    };

    return suggestions[errorCode] ?? "Review TypeScript documentation for this error";
  }
}
