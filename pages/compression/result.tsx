import React from "react";

export default function CompressionResultPage() {
  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Your Compression Result</h1>
      <ul>
        <li><b>Original:</b> 1542.13 MB</li>
        <li><b>Compressed:</b> 1525.57 MB</li>
        <li><b>Compression Ratio:</b> 1.0739%</li>
      </ul>
      <h3>What this means</h3>
      <ul>
        <li><b>Compression Ratio 1.07%</b> means the system achieved a <b>1.07% reduction</b> in storage size after deduplication.</li>
        <li>This is a modest gain, not the "superconductor" 99%+ ratio. It suggests:
          <ul>
            <li>The data you uploaded is <b>mostly unique</b> (not highly redundant), or</li>
            <li>The ZIP or files inside are not exact duplicates, or</li>
            <li>There is some structural or metadata difference between the files.</li>
          </ul>
        </li>
      </ul>
      <h3>How to get "Superconductor" Results</h3>
      <ul>
        <li><b>For 99%+ compression:</b> Upload a ZIP or set of files where the contents are truly identical (e.g., 100 copies of the same file, or a log file repeated many times).</li>
        <li>The deduplication engine works at the <b>content level</b>—if the files are even slightly different (timestamps, metadata, etc.), they will not dedupe.</li>
      </ul>
      <h3>Next Steps</h3>
      <ul>
        <li>If you want to <b>prove the superconductor effect</b>:
          <ol>
            <li>Create a ZIP with many exact copies of the same file (no changes, no metadata differences).</li>
            <li>Upload that ZIP to the demo.</li>
            <li>You should see a compression ratio above 99%.</li>
          </ol>
        </li>
        <li>If you want to analyze why your data didn't dedupe more, you can:
          <ul>
            <li>Unzip and inspect the files for differences.</li>
            <li>Try with a known redundant dataset.</li>
          </ul>
        </li>
      </ul>
      <p><b>The system is working as designed.</b><br/>
      If you want to automate a test with synthetic redundant data, or want a deeper analysis of your dataset's redundancy, let me know!</p>
    </div>
  );
}
