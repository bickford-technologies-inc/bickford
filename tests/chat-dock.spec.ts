import { test, expect } from "@playwright/test";

test.describe("Chat Dock Guardrails", () => {
  test("chat is docked, collapsed, and non-primary", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000");

    await expect(page.locator('[data-testid="chat-panel"]')).toHaveCount(0);

    const dockButton = page.locator('[data-testid="chat-dock-button"]');
    await expect(dockButton).toBeVisible();

    await dockButton.click();

    const panel = page.locator('[data-testid="chat-panel"]');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box?.x).toBeGreaterThan(900);
    expect(box?.y).toBeGreaterThan(350);

    await page.locator('[data-testid="chat-close"]').click();
    await expect(panel).toHaveCount(0);
  });
});
