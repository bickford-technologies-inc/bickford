import ChatWindow from "./components/ChatWindow";
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
        <ChatWindow />
      </body>
    </html>
  );
}
