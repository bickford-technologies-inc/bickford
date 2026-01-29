import React, { useState } from "react";
// For hashing in-browser (SHA-256)
const hashBuffer = async (buf: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};

async function deduplicateFiles(files: Array<{ name: string; data: ArrayBuffer }>) {
  const seen = new Set<string>();
  let originalBytes = 0;
  let uniqueBytes = 0;
  for (const { data } of files) {
    originalBytes += data.byteLength;
    const hash = await hashBuffer(data);
    if (!seen.has(hash)) {
      seen.add(hash);
      uniqueBytes += data.byteLength;
    }
  }
  // Storage is uniqueBytes + 64*seen.size (pointer references)
  const pointerBytes = seen.size * 64;
  const compressedBytes = uniqueBytes + pointerBytes;
  return { originalBytes, compressedBytes, ratio: 1 - compressedBytes / originalBytes };
}

export default function CompressionDemo() {
  const [files, setFiles] = useState<Array<{ name: string; data: ArrayBuffer }>>([]);
  const [metrics, setMetrics] = useState<{originalBytes: number, compressedBytes: number, ratio: number} | null>(null);

  const handleFiles = async (fileList: FileList) => {
    const arr: Array<{ name: string; data: ArrayBuffer }> = [];
    for (let i = 0; i < fileList.length; ++i) {
      arr.push({ name: fileList[i].name, data: await fileList[i].arrayBuffer() });
    }
    setFiles(arr);
    const res = await deduplicateFiles(arr);
    setMetrics(res);
  };

  // Allow text paste as well (for demo)  
  const handleText = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length > 0) {
      const enc = new TextEncoder();
      setFiles([{ name: "input.txt", data: enc.encode(text).buffer }]);
      const res = await deduplicateFiles([{ name: "input.txt", data: enc.encode(text).buffer }]);
      setMetrics(res);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 24, maxWidth: 600 }}>
      <h2>Compression Proof Demo</h2>
      <p>
        <b>Import files</b>: Drag & drop or select redundant files below.<br/>
        <b>Paste text</b>: Directly to see single-sample compression.
      </p>

      <input
        type="file"
        multiple
        onChange={e => e.target.files && handleFiles(e.target.files)}
        style={{ marginBottom: 16 }}
      />

      <div>Or paste redundant text:</div>
      <textarea rows={4} style={{ width: "100%", margin: "8px 0" }} onChange={handleText} />

      {metrics && (
        <div style={{ background: "#eef", marginTop: 24, padding: 16, borderRadius: 8 }}>
          <b>Compression Results:</b>
          <div>Original: <b>{(metrics.originalBytes / (1024 * 1024)).toFixed(2)} MB</b></div>
          <div>Compressed: <b>{(metrics.compressedBytes / (1024 * 1024)).toFixed(2)} MB</b></div>
          <div>
            Compression Ratio: <b>{(metrics.ratio * 100).toFixed(4)}%</b>
          </div>
        </div>
      )}
    </div>
  );
}
