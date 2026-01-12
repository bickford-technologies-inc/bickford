export const metadata = {
  title: 'Bickford Execution',
  description: 'Execution-grade persistence engine',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head />
      <body style={{ fontFamily: "monospace", padding: 20 }}>
        {children}
      </body>
    </html>
  );
}
