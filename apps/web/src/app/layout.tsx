/**
 * Root layout for Bickford web app
 */

export const metadata = {
  title: "Bickford - Intent → Reality",
  description: "Zero-approval execution runtime with OPTR gating, canon enforcement, and immutable ledger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
