import fs from "fs";
import path from "path";

const PKGS = "packages";

const BASE = {
  extends: "../../tsconfig.json",
  compilerOptions: {
    outDir: "dist",
    declaration: true,
    declarationMap: true,
    emitDeclarationOnly: false,
    noEmitOnError: true,
  },
  include: ["src"],
};

for (const name of fs.readdirSync(PKGS)) {
  const dir = path.join(PKGS, name);
  if (!fs.existsSync(path.join(dir, "package.json"))) continue;

  const cfg = path.join(dir, "tsconfig.build.json");
  if (fs.existsSync(cfg)) continue;

  fs.writeFileSync(cfg, JSON.stringify(BASE, null, 2) + "\n");
  console.log("✔ tsconfig.build.json created for", name);
}
