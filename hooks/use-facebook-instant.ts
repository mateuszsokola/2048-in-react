import { useEffect, useState } from "react";

// The FB Instant Games startup handshake is driven by the inline bootstrap
// script in `pages/_document.tsx` (so it doesn't depend on React hydration).
// This hook only observes the result: it reveals the game once the bootstrap
// signals completion, or immediately when there is no SDK (local dev).
export default function useFacebookInstant(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // No SDK on the window → local dev / non-FB host: render the game now.
    if (!window.FBInstant) {
      setReady(true);
      return;
    }

    // Bootstrap already finished before React mounted.
    if (window.__FB_INSTANT_READY__) {
      setReady(true);
      return;
    }

    // Otherwise wait for the bootstrap's completion signal.
    const onReady = () => setReady(true);
    window.addEventListener("fb-instant-ready", onReady);
    return () => window.removeEventListener("fb-instant-ready", onReady);
  }, []);

  return ready;
}
