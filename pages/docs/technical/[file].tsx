import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function TechnicalDocPage() {
  const router = useRouter();
  const { file } = router.query;
  const [doc, setDoc] = useState<{ content: string; hash: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof file === "string") {
      fetch(`/api/docs/technical/${file}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else setDoc(data);
        });
    }
  }, [file]);

  if (!file) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!doc) return <div>Loading document...</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
      <h1>{file}</h1>
      <pre
        style={{
          background: "#f7f7f7",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {doc.content}
      </pre>
      <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
        SHA256: <code>{doc.hash}</code>
      </div>
    </div>
  );
}
