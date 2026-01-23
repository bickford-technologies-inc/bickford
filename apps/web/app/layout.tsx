import "./globals.css";

import { assertUiLedgerBinding } from "../lib/uiBinding";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertUiLedgerBinding();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
