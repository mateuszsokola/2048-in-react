import { GameContext } from "@/context/game-context";
import useShareScore from "@/hooks/use-share-score";
import styles from "@/styles/splash.module.css";
import { useContext, useState } from "react";

export default function Splash({ heading = "You won!", type = "" }) {
  const { score, startGame } = useContext(GameContext);
  const { canShare, shareScore } = useShareScore();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    await shareScore(score, type === "won");
    setIsSharing(false);
  };

  return (
    <div className={`${styles.splash} ${type === "won" && styles.win}`}>
      <div>
        <h1>{heading}</h1>
        <button className={styles.button} onClick={startGame}>
          Play again
        </button>
        {canShare && (
          <button
            className={styles.button}
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? "Sharing…" : "Share score"}
          </button>
        )}
      </div>
    </div>
  );
}
