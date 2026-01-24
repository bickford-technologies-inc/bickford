import type { GeneratedFile, ValidationResult } from "../types.js";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
const CLIENT_ONLY_APIS = [
  "useState",
  "useEffect",
  "useLayoutEffect",
  "useReducer",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
];

export class NextJSValidator {
  readonly name = "nextjs";

  validate(files: GeneratedFile[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];

    for (const file of files) {
      if (file.path.includes("/app/") && file.path.endsWith("/route.ts")) {
        this.validateRouteHandler(file, errors);
      }

      if (file.content.includes("use server")) {
        this.validateServerAction(file, errors);
      }

      if (file.path.includes("/app/") && file.path.endsWith(".tsx")) {
        this.validateServerComponent(file, errors);
      }

      if (file.path.includes("/pages/api/")) {
        errors.push({
          type: "nextjs",
          file: file.path,
          line: 1,
          message: "Use app/api/*/route.ts instead of pages/api/* (Next.js 14+)",
          suggestion: "Migrate to App Router: app/api/[name]/route.ts",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateRouteHandler(file: GeneratedFile, errors: ValidationResult["errors"]): void {
    const hasMethod = HTTP_METHODS.some((method) =>
      file.content.includes(`export async function ${method}`),
    );

    if (!hasMethod) {
      errors.push({
        type: "nextjs",
        file: file.path,
        line: 1,
        message: "Route handler must export at least one HTTP method",
        suggestion: "Add: export async function GET(request: Request) { ... }",
      });
    }

    if (file.content.includes("export default")) {
      errors.push({
        type: "nextjs",
        file: file.path,
        line: 1,
        message: "Route handlers must use named exports, not default export",
        suggestion: "Use: export async function GET() instead of export default",
      });
    }
  }

  private validateServerAction(file: GeneratedFile, errors: ValidationResult["errors"]): void {
    const lines = file.content.split("\n");
    const firstLine = lines[0]?.trim() ?? "";

    if (firstLine !== '"use server"' && firstLine !== "'use server'") {
      errors.push({
        type: "nextjs",
        file: file.path,
        line: 1,
        message: '"use server" directive must be first line of file',
        suggestion: 'Move "use server" to line 1',
      });
    }

    const exportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
    for (const match of file.content.matchAll(exportRegex)) {
      if (!match[0].includes("async")) {
        const line = file.content.substring(0, match.index ?? 0).split("\n").length;
        errors.push({
          type: "nextjs",
          file: file.path,
          line,
          message: `Server action ${match[1]} must be async`,
          suggestion: `Change to: export async function ${match[1]}`,
        });
      }
    }

    const exportConstRegex = /export\s+const\s+(\w+)\s*=\s*(?!async)/g;
    for (const match of file.content.matchAll(exportConstRegex)) {
      const line = file.content.substring(0, match.index ?? 0).split("\n").length;
      errors.push({
        type: "nextjs",
        file: file.path,
        line,
        message: `Server action ${match[1]} must be async`,
        suggestion: `Change to: export const ${match[1]} = async () => ...`,
      });
    }
  }

  private validateServerComponent(file: GeneratedFile, errors: ValidationResult["errors"]): void {
    const hasClientAPI = CLIENT_ONLY_APIS.some((api) => file.content.includes(api));
    const hasUseClient = file.content.includes('"use client"') || file.content.includes("'use client'");

    if (hasClientAPI && !hasUseClient) {
      errors.push({
        type: "nextjs",
        file: file.path,
        line: 1,
        message: 'Component uses client-only APIs but missing "use client" directive',
        suggestion: 'Add "use client" as first line of file',
      });
    }
  }
}
