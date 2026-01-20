import ChatDock from "./components/ChatDock";
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
