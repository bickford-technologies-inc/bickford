import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RepoFilePage() {
  const router = useRouter();
  const { path } = router.query;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [execResult, setExecResult] = useState<any>(null);
  const [execLoading, setExecLoading] = useState(false);

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

  const handleExec = async () => {
    setExecLoading(true);
    setExecResult(null);
    const file = Array.isArray(path) ? path.join("/") : path;
    const res = await fetch("/api/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
    const result = await res.json();
    setExecResult(result);
    setExecLoading(false);
  };

  if (!path) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!data) return <div>Loading file...</div>;

  const currentPath = Array.isArray(path) ? path.join("/") : path;

  if (data.type === "directory") {
    return (
      <div className="repo-page">
        <div className="repo-card">
          <div className="repo-header">
            <div>
              <p className="repo-overline">{currentPath}</p>
              <h1>Structure</h1>
            </div>
            <p className="repo-lead">
              Top-level directories represent major product and platform areas.
              Keep new executables and supporting assets inside their respective
              product subdirectories so ownership and navigation stay clear.
            </p>
            <p className="repo-note">
              Use the explorer below to browse files and folders in this
              workspace.
            </p>
          </div>

          <div className="repo-section">
            <details open>
              <summary>Files and Directories</summary>
              <div className="repo-grid">
                {data.files.map((file: string) => {
                  const isFile = file.includes(".");
                  return (
                    <a
                      className="repo-item"
                      key={file}
                      href={`/${Array.isArray(path) ? `repo/${path.join("/")}/` : "repo/"}${file}`}
                    >
                      <span className="repo-icon" aria-hidden="true">
                        {isFile ? "📄" : "📁"}
                      </span>
                      <span className="repo-item-label">{file}</span>
                    </a>
                  );
                })}
              </div>
            </details>
          </div>

          <div className="repo-section">
            <details>
              <summary>Generated Files and Directories</summary>
              <div className="repo-empty">
                No generated files are available for this directory yet.
              </div>
            </details>
          </div>
        </div>
        <style jsx>{`
          .repo-page {
            min-height: 100vh;
            padding: 48px 24px 64px;
            background: #0c0f14;
            color: #e7e9ee;
          }
          .repo-card {
            max-width: 980px;
            margin: 0 auto;
            background: #121722;
            border: 1px solid #22293a;
            border-radius: 20px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
            padding: 32px 32px 40px;
          }
          .repo-header {
            display: flex;
            flex-direction: column;
            gap: 16px;
            border-bottom: 1px solid #1f2634;
            padding-bottom: 24px;
          }
          .repo-overline {
            text-transform: uppercase;
            letter-spacing: 0.16em;
            font-size: 11px;
            color: #8a94a7;
            margin: 0 0 8px;
          }
          .repo-header h1 {
            margin: 0;
            font-size: 28px;
          }
          .repo-lead {
            margin: 0;
            color: #c6cbd6;
            line-height: 1.6;
          }
          .repo-note {
            margin: 0;
            color: #aab2c2;
            font-size: 14px;
          }
          .repo-section {
            margin-top: 24px;
          }
          details {
            background: #0f131c;
            border: 1px solid #1f2634;
            border-radius: 12px;
            padding: 16px 18px;
          }
          summary {
            cursor: pointer;
            font-weight: 600;
            color: #e7e9ee;
            list-style: none;
          }
          summary::-webkit-details-marker {
            display: none;
          }
          summary::before {
            content: "▸";
            display: inline-block;
            margin-right: 10px;
            transition: transform 0.2s ease;
            color: #8cc5ff;
          }
          details[open] summary::before {
            transform: rotate(90deg);
          }
          .repo-grid {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
          }
          .repo-item {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #141a26;
            border: 1px solid #1f2634;
            border-radius: 10px;
            padding: 10px 12px;
            color: #d7dbea;
            text-decoration: none;
            transition: border-color 0.2s ease, transform 0.2s ease;
          }
          .repo-item-label {
            word-break: break-word;
          }
          .repo-item:hover {
            border-color: #8cc5ff;
            transform: translateY(-1px);
          }
          .repo-icon {
            font-size: 16px;
          }
          .repo-empty {
            margin-top: 16px;
            color: #9aa3b4;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const isExecutable = data.file.match(
    /^((scripts\/)?[a-zA-Z0-9_.-]+\.(sh|js|ts))$/,
  );

  return (
    <div className="repo-page">
      <div className="repo-card">
        <div className="repo-header">
          <div>
            <p className="repo-overline">{currentPath}</p>
            <h1>{data.file}</h1>
          </div>
        </div>
        <pre className="repo-code">{data.content}</pre>
        <div className="repo-hash">
          SHA256: <code>{data.hash}</code>
        </div>
        {isExecutable && (
          <div className="repo-exec">
            <button
              onClick={handleExec}
              disabled={execLoading}
              className="repo-button"
            >
              {execLoading ? "Running..." : "Run Script"}
            </button>
            {execResult && (
              <div className="repo-result">
                <b>Execution Result:</b>
                <pre className="repo-result-output">
                  {execResult.stdout || ""}
                  {execResult.stderr ? `\n[stderr]\n${execResult.stderr}` : ""}
                  {execResult.error ? `\n[error]\n${execResult.error}` : ""}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        .repo-page {
          min-height: 100vh;
          padding: 48px 24px 64px;
          background: #0c0f14;
          color: #e7e9ee;
        }
        .repo-card {
          max-width: 980px;
          margin: 0 auto;
          background: #121722;
          border: 1px solid #22293a;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          padding: 32px;
        }
        .repo-header {
          border-bottom: 1px solid #1f2634;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .repo-overline {
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 11px;
          color: #8a94a7;
          margin: 0 0 8px;
        }
        .repo-header h1 {
          margin: 0;
          font-size: 28px;
        }
        .repo-code {
          background: #0f131c;
          border: 1px solid #1f2634;
          padding: 16px;
          border-radius: 12px;
          overflow-x: auto;
          color: #d7dbea;
          line-height: 1.6;
        }
        .repo-hash {
          margin-top: 16px;
          font-size: 12px;
          color: #9aa3b4;
        }
        .repo-exec {
          margin-top: 24px;
        }
        .repo-button {
          background: #8cc5ff;
          color: #0c0f14;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
          font-weight: 600;
        }
        .repo-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .repo-result {
          margin-top: 16px;
        }
        .repo-result-output {
          background: #111621;
          color: #e7e9ee;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #1f2634;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
