import Board from "@/components/board";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Play 2048!</title>
        <meta name="description" content="2048 in React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Board />
      </main>
    </>
  );
}
