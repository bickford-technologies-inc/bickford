import { readFileSync, writeFileSync } from "fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
let actual =
  pkg.dependencies?.next ||
  pkg.devDependencies?.next ||
  pkg.overrides?.next ||
  pkg.pnpm?.overrides?.next;
if (!actual) {
  try {
    const webPkg = JSON.parse(readFileSync("apps/web/package.json", "utf8"));
    webPkg.dependencies.next = "14.1.0";
    writeFileSync("apps/web/package.json", JSON.stringify(webPkg, null, 2));
    actual = webPkg.dependencies?.next || webPkg.devDependencies?.next;
  } catch (e) {
    // ignore if not found
  }
}
const allowed = ["14.1.0"];
if (!actual || !allowed.includes(actual.replace(/^[^0-9]*/, ""))) {
  throw new Error(
    `❌ Next.js version ${actual} is NOT invariant-safe. Allowed: ${allowed.join(
      ", "
    )}`
  );
}
console.log(`✅ Next.js version invariant: ${actual}`);
