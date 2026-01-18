import fs from "fs";
import path from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: pnpm promote <name>");
  process.exit(1);
}

const dir = path.join("packages", name);

fs.mkdirSync(path.join(dir, "src"), { recursive: true });

fs.writeFileSync(
  path.join(dir, "package.json"),
  JSON.stringify(
    {
      name: `@bickford/${name}`,
      version: "0.0.0",
      private: true,
      type: "module",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      files: ["dist"],
      scripts: {
        build: "tsc -p tsconfig.json",
      },
    },
    null,
    2,
  ),
);

fs.writeFileSync(
  path.join(dir, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        outDir: "dist",
        rootDir: "src",
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        declaration: true,
        strict: false,
        skipLibCheck: true,
      },
      include: ["src"],
    },
    null,
    2,
  ),
);

fs.writeFileSync(path.join(dir, "src/index.ts"), `// ${name} public surface\n`);

console.log(`✅ Promoted ${name} → packages/${name}`);
