import { write, file } from "bun";

const testPath = "outputs/optr/append_test.log";

// Truncate file
await write(testPath, "");

for (let i = 1; i <= 10; i++) {
  await write(testPath, `Line ${i}\n`, { append: true });
}

const lines = (await file(testPath).text()).trim().split("\n");
console.log(`Lines in append test: ${lines.length}`);
console.log(lines);
