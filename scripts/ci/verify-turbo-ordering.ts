import fs from "fs";
import path from "path";

const runsDir = path.resolve(".turbo/runs");

if (!fs.existsSync(runsDir)) {
  console.error("❌ Turbo runs directory not found");
  process.exit(1);
}

const runs = fs
  .readdirSync(runsDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(runsDir, f), "utf8")));

let violations: string[] = [];

for (const run of runs) {
  const tasks = run.tasks ?? [];

  const buildIndex = new Map<string, number>();

  tasks.forEach((t: any, i: number) => {
    if (t.task === "build") {
      buildIndex.set(t.package, i);
    }
  });

  tasks.forEach((t: any, i: number) => {
    if (t.task === "prebuild") {
      const deps = t.dependencies ?? [];

      for (const dep of deps) {
        const depBuildIndex = buildIndex.get(dep);
        if (depBuildIndex === undefined || depBuildIndex > i) {
          violations.push(`❌ ${t.package}#prebuild ran before ${dep}#build`);
        }
      }
    }
  });
}

if (violations.length) {
  console.error("\n🚨 TURBO ORDERING VIOLATION DETECTED\n");
  violations.forEach((v) => console.error(v));
  console.error("\nFix turbo.json dependsOn configuration.\n");
  process.exit(1);
}

console.log("✅ Turbo task ordering verified");
