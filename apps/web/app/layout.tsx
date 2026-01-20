import ChatWindow from "../components/ChatWindow";

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
