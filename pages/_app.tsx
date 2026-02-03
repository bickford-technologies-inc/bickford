import type { AppProps } from "next/app";
import "../styles/globals.css";
import ShowBickfordChat from "../platform/ui/renderer/components/ShowBickfordChat";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ShowBickfordChat />
    </>
  );
}
