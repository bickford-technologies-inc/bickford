import type { AppProps } from "next/app";
import "../styles/globals.css";
import BickfordChat from "../platform/ui/renderer/components/chat/BickfordChat";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <BickfordChat />
    </>
  );
}
