import { Pacifico } from "next/font/google";

const bickfordFont = Pacifico({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export default function Page() {
  return (
    <main style={{ padding: 32 }}>
      <h1
        className={bickfordFont.className}
        style={{ fontSize: 48, fontWeight: 400, margin: 0 }}
      >
        bickford
      </h1>
    </main>
  );
}
