export function forbidDeepImports() {
  return {
    name: "forbid-deep-imports",
    enforce: "pre",
    resolveId(source) {
      if (source.includes("/src/")) {
        throw new Error(`Forbidden deep import: ${source}`);
      }
      return null;
    },
  };
}
