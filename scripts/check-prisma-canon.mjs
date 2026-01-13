import fs from "fs";

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const models = new Set(
  [...schema.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1].toLowerCase())
);

const scan = (dir) =>
  fs
    .readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .map((f) => `${dir}/${f}`);

const files = [...scan("apps"), ...scan("packages")];

let violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const [, model] of content.matchAll(/prisma\.(\w+)/g)) {
    if (!models.has(model.toLowerCase())) {
      violations.push(`${file}: prisma.${model}`);
    }
  }
}

if (violations.length) {
  console.error("❌ Prisma canon violations:");
  violations.forEach((v) => console.error("  " + v));
  process.exit(1);
}

console.log("✅ Prisma canon verified");
