import React, { useState } from "react";
import JSZip from "jszip";

// SHA-256 hashing for content addressing
const hashBuffer = async (buf: ArrayBuffer): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Extract files from FileList, recursively unpacking ZIPs
async function extractFiles(fileList: FileList) {
  let files: Array<{ name: string; data: ArrayBuffer }> = [];
  for (let i = 0; i < fileList.length; ++i) {
    const file = fileList[i];
    if (file.name.endsWith(".zip")) {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((f) => !f.dir);
      for (const entry of entries) {
        const data = await entry.async("arraybuffer");
        files.push({ name: entry.name, data });
      }
    } else {
      files.push({ name: file.name, data: await file.arrayBuffer() });
    }
  }
  return files;
}

// Deduplicate by content hash
async function deduplicateFiles(
  files: Array<{ name: string; data: ArrayBuffer }>,
) {
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
  const pointerBytes = seen.size * 64;
  const compressedBytes = uniqueBytes + pointerBytes;
  return {
    originalBytes,
    compressedBytes,
    ratio: originalBytes > 0 ? 1 - compressedBytes / originalBytes : 0,
  };
}

export default function CompressionDemo() {
  const [metrics, setMetrics] = useState<{
    originalBytes: number;
    compressedBytes: number;
    ratio: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (fileList: FileList) => {
    setLoading(true);
    try {
      const arr = await extractFiles(fileList);
      setMetrics(await deduplicateFiles(arr));
    } finally {
      setLoading(false);
    }
  };

  const handleText = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length > 0) {
      const enc = new TextEncoder();
      const arr = [{ name: "input.txt", data: enc.encode(text).buffer }];
      setMetrics(await deduplicateFiles(arr));
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 24, maxWidth: 600 }}>
      <h2>Compression Proof Demo</h2>
      <p>
        <b>Import files</b>: Drag & drop or select redundant files (.zip
        supported)
        <br />
        <b>Paste text</b>: Directly to see single-sample compression.
      </p>
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        style={{ marginBottom: 16 }}
        accept=".zip,*"
      />
      <div>Or paste redundant text:</div>
      <textarea
        rows={4}
        style={{ width: "100%", margin: "8px 0" }}
        onChange={handleText}
      />
      {loading && <div>Processing...</div>}
      {metrics && !loading && (
        <div
          style={{
            background: "#eef",
            marginTop: 24,
            padding: 16,
            borderRadius: 8,
          }}
        >
          <b>Compression Results:</b>
          <div>
            Original:{" "}
            <b>{(metrics.originalBytes / (1024 * 1024)).toFixed(2)} MB</b>
          </div>
          <div>
            Compressed:{" "}
            <b>{(metrics.compressedBytes / (1024 * 1024)).toFixed(2)} MB</b>
          </div>
          <div>
            Compression Ratio: <b>{(metrics.ratio * 100).toFixed(4)}%</b>
          </div>
        </div>
      )}
    </div>
  );
}
