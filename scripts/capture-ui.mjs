import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const playwrightPath = path.join(root, "node_modules", "playwright");
const dbusSocket = "/run/dbus/system_bus_socket";

if (!fs.existsSync(playwrightPath)) {
  console.log(
    "Skipping screenshots: Playwright is not installed. Install it to enable UI capture.",
  );
  process.exit(0);
}

if (!fs.existsSync(dbusSocket)) {
  console.log(
    "Skipping screenshots: D-Bus socket not available in this environment.",
  );
  process.exit(0);
}

const { chromium } = await import("playwright");

const targetUrl = process.env.UI_CAPTURE_URL ?? "http://localhost:3000";
const outputDir = process.env.UI_CAPTURE_DIR ?? "artifacts";
const outputPath = path.join(outputDir, "landing.png");

fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(targetUrl, { waitUntil: "networkidle" });
await page.setViewportSize({ width: 1280, height: 720 });
await page.waitForTimeout(500);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Saved screenshot to ${outputPath}`);
