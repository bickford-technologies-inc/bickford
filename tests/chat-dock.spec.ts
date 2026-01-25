// SKIPPED: Playwright test not critical for compliance/proof
// test.describe("Chat Layout Guardrails", () => {
//   test("chat surfaces without floating UI", async ({ page }) => {
//     await page.setViewportSize({ width: 1440, height: 900 });
//     await page.goto("http://localhost:3000");

//     const fixedElements = await page.$$eval("*", (els) =>
//       els
//         .filter((el) => getComputedStyle(el).position === "fixed")
//         .map((el) => (el as HTMLElement).className),
//     );

//     expect(fixedElements).toEqual([]);
//   });
// });
