import type { AppProps } from "next/app";
import "../styles/globals.css";
import { BickfordCommandDock } from "../components/BickfordCommandDock";
import { BickfordChat } from "../components/BickfordChat";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <BickfordCommandDock />
      <BickfordChat />
    </>
  );
}
