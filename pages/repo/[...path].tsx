import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RepoFilePage() {
  const router = useRouter();
  const { path } = router.query;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    const url = Array.isArray(path)
      ? `/api/repo/${path.join("/")}`
      : `/api/repo/${path}`;
    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      });
  }, [path]);

  if (!path) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>Loading file...</div>;

  if (data.type === "directory") {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
        <h1>Directory: {Array.isArray(path) ? path.join("/") : path}</h1>
        <ul>
          {data.files.map((f: string) => (
            <li key={f}>
              <a
                href={`/${Array.isArray(path) ? `repo/${path.join("/")}/` : "repo/"}${f}`}
              >
                {f}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}>
      <h1>{data.file}</h1>
      <pre
        style={{
          background: "#f7f7f7",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {data.content}
      </pre>
      <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
        SHA256: <code>{data.hash}</code>
      </div>
    </div>
  );
}
