import type { Metadata } from "next";
import React from "react";
import ChatWindow from "./components/ChatWindow";

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
      <body>
        {children}
        <ChatWindow />
      </body>
    </html>
  );
}
