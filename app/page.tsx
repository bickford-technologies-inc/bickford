import Link from "next/link";

export default function Page() {
  return (
    <main className="landing">
      <h1>What should we do next?</h1>
      <p>
        Start a session in <Link href="/chat">chat</Link>, then ask a question
        with <code>/plan</code>.
      </p>
    </main>
  );
}
