import useShareScore from "@/hooks/use-share-score";
import styles from "@/styles/splash.module.css";

// TEMPORARY test affordance: fires the share flow with mock data so the
// Facebook share modal can be verified without reaching a real game-over.
// Delete this component (and its use in pages/index.tsx) once the
// share-on-game-over flow is confirmed working in the FB test env.
const MOCK_SCORE = 4820;
const MOCK_WON = true;

export default function ShareTestButton() {
  const { shareScore } = useShareScore();

  return (
    <button
      className={styles.button}
      onClick={() => shareScore(MOCK_SCORE, MOCK_WON)}
    >
      Share score (test)
    </button>
  );
}
