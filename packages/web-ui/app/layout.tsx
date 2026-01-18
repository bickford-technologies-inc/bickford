import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Bickford",
  description: "Decision Continuity Runtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
