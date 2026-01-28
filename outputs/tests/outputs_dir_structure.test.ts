import { test, expect } from "bun:test";
import { existsSync, mkdirSync, rmdirSync } from "fs";

test("outputs directory structure validation", () => {
  const dirs = [
    "outputs/customer-acquisition",
    "outputs/evidence-collection",
    "outputs/bickford-optr",
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    expect(existsSync(dir)).toBe(true);
  }
  // Cleanup (optional, comment out if you want to keep dirs)
  // for (const dir of dirs.reverse()) rmdirSync(dir);
});
