import type { AppProps } from "next/app";
import GameProvider from "@/context/game-context";
import useFacebookInstant from "@/hooks/use-facebook-instant";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const ready = useFacebookInstant();

  if (!ready) {
    return null;
  }

  return (
    <GameProvider>
      <Component {...pageProps} />
    </GameProvider>
  );
}
