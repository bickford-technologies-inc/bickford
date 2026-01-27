import "./globals.css";

import { assertUiLedgerBinding } from "../lib/uiBinding";
import Link from "next/link";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertUiLedgerBinding();
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: 16, background: "#12141b", color: "#f5f7ff" }}>
          <Link href="/" style={{ marginRight: 16 }}>
            Home
          </Link>
          <Link href="/chat" style={{ marginRight: 16 }}>
            Chat
          </Link>
          <Link href="/decision-trace-viewer" style={{ marginRight: 16 }}>
            Decision Trace Viewer
          </Link>
          <Link href="/canon-dag" style={{ marginRight: 16 }}>
            Canon DAG
          </Link>
          <Link href="/platform">Platform</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
