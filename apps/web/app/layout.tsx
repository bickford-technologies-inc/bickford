/**
 * CHAT DOCK RULE:
 * - Utility only
 * - Collapsed by default
 * - Must never be landing UI
 * - Must never replace Intents / Tracer views
 */
import ChatDock from "../components/ChatDock";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatDock />
      </body>
    </html>
  );
}
