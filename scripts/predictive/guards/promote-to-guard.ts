import fs from "fs";

export function promoteToGuard(pattern: string) {
  const guardName = pattern.replace(/[:/]/g, "-");
  fs.writeFileSync(
    `scripts/predictive/guards/${guardName}.ts`,
    `export const guard = () => {
       throw new Error(\"Known failure pattern: ${pattern}\");
     };`
  );
}
