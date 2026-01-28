#!/usr/bin/env ts-node
/**
 * Weekly Progress Report Automation
 * Generates comprehensive weekly status report for acquisition readiness
 */

import * as fs from "fs";
import * as path from "path";

const inputDir = path.join(__dirname, "../data");
const outputDir = path.join(__dirname, "../output");

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(inputDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const lineCount = lines.length;
      const wordCount = lines.reduce(
        (acc, line) => acc + line.split(" ").length,
        0,
      );
      const charCount = lines.reduce((acc, line) => acc + line.length, 0);
      const uniqueWords = new Set(lines.join(" ").split(" ").filter(Boolean));
      const uniqueWordCount = uniqueWords.size;

      console.log(`File: ${file}`);
      console.log(`Lines: ${lineCount}`);
      console.log(`Words: ${wordCount}`);
      console.log(`Characters: ${charCount}`);
      console.log(`Unique words: ${uniqueWordCount}`);
    }
  });
});
