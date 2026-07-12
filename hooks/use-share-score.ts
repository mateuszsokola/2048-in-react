import { useMemo } from "react";
import { drawScoreCard } from "@/lib/score-card";

function buildShareText(score: number): string {
  return `I scored ${score} in 2048! Can you beat me?`;
}

export default function useShareScore(): {
  canShare: boolean;
  shareScore: (score: number, won: boolean) => Promise<void>;
} {
  const canShare = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    if (typeof window.FBInstant?.shareAsync === "function") {
      return true;
    }
    return (
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const shareScore = async (score: number, won: boolean) => {
    const image = drawScoreCard({ score, won });
    const text = buildShareText(score);
    // Web Share fallback links back to the hosted game. The URL is configured
    // via NEXT_PUBLIC_GAME_URL (see .env.example) and inlined at build time; the
    // Facebook Instant path needs no URL — FB routes friends back in itself.
    const gameUrl = process.env.NEXT_PUBLIC_GAME_URL;

    try {
      if (typeof window.FBInstant?.shareAsync === "function") {
        await window.FBInstant.shareAsync({
          intent: "SHARE",
          image,
          text,
          data: { score },
        });
      } else if (typeof navigator?.share === "function") {
        await navigator.share(gameUrl ? { text, url: gameUrl } : { text });
      }
    } catch (err) {
      // User cancelled or the SDK errored — nothing to recover; stay silent.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[useShareScore] share failed:", err);
      }
    }
  };

  return { canShare, shareScore };
}
