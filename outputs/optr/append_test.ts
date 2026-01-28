import { write, file } from "bun";

const testPath = "outputs/optr/append_test.log";

(async () => {
  // Truncate file
  await write(testPath, "");

  for (let i = 1; i <= 10; i++) {
    // Read current content
    let current = "";
    try {
      current = await file(testPath).text();
    } catch {}
    // Append new line in memory
    const updated = current + `Line ${i}\n`;
    await write(testPath, updated);
  }

  const lines = (await file(testPath).text()).trim().split("\n");
  console.log(`Lines in append test: ${lines.length}`);
  console.log(lines);
})();
