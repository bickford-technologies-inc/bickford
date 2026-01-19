import fs from "fs";
import path from "path";

const PKGS = "packages";
const graph = {};

for (const name of fs.readdirSync(PKGS)) {
  const dir = path.join(PKGS, name);
  const pkgJson = path.join(dir, "package.json");
  if (!fs.existsSync(pkgJson)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
  if (!pkg.name?.startsWith("@bickford/")) continue;

  graph[pkg.name] = Object.keys(pkg.dependencies || {}).filter((d) =>
    d.startsWith("@bickford/"),
  );
}

fs.writeFileSync("build-graph.json", JSON.stringify(graph, null, 2));
console.log("📈 build-graph.json generated");
