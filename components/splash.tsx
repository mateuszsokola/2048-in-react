import { GameContext } from "@/context/game-context";
import styles from "@/styles/splash.module.css";
import { useContext } from "react";

export default function Splash({ heading = "You won!", type = "" }) {
  const { startGame } = useContext(GameContext);

  return (
    <div className={`${styles.splash} ${type === "won" && styles.win}`}>
      <div>
        <h1>{heading}</h1>
        <button className={styles.button} onClick={startGame}>
          Play again
        </button>
      </div>
    </div>
  );
}
