import dynamic from "next/dynamic";

const BickfordChat = dynamic(
  () => import("../components/BickfordChat").then((m) => m.BickfordChat),
  { ssr: false },
);

export default function ChatPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7" }}>
      <h1 style={{ textAlign: "center", marginTop: 32 }}>
        Bickford Conversational Chat
      </h1>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
        <BickfordChat />
      </div>
    </div>
  );
}
