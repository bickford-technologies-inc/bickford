/**
 * Root layout for Bickford web app
 */

export const metadata = {
  title: "Bickford",
  description: "Decision Continuity Runtime",
};

import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
