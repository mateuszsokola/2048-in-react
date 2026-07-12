import { renderHook } from "@testing-library/react";
import useShareScore from "@/hooks/use-share-score";

jest.mock("@/lib/score-card", () => ({
  drawScoreCard: jest.fn(() => "data:image/png;base64,FAKE"),
}));

describe("useShareScore", () => {
  const originalShare = (navigator as Navigator).share;
  const originalGameUrl = process.env.NEXT_PUBLIC_GAME_URL;

  // Arbitrary test fixture — the real URL lives only in .env.local, never in code.
  const TEST_GAME_URL = "https://game.example/play";

  afterEach(() => {
    delete window.FBInstant;
    Object.defineProperty(navigator, "share", {
      value: originalShare,
      configurable: true,
    });
    process.env.NEXT_PUBLIC_GAME_URL = originalGameUrl;
    jest.clearAllMocks();
  });

  it("canShare is false with no SDK and no navigator.share", () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    const { result } = renderHook(() => useShareScore());
    expect(result.current.canShare).toBe(false);
  });

  it("uses FBInstant.shareAsync when available", async () => {
    const shareAsync = jest.fn().mockResolvedValue(undefined);
    window.FBInstant = { shareAsync } as unknown as typeof window.FBInstant;

    const { result } = renderHook(() => useShareScore());
    expect(result.current.canShare).toBe(true);

    await result.current.shareScore(1024, true);

    expect(shareAsync).toHaveBeenCalledWith({
      intent: "SHARE",
      image: "data:image/png;base64,FAKE",
      text: "I scored 1024 in 2048! Can you beat me?",
      data: { score: 1024 },
    });
  });

  it("falls back to navigator.share with the configured game URL when there is no SDK", async () => {
    process.env.NEXT_PUBLIC_GAME_URL = TEST_GAME_URL;
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });

    const { result } = renderHook(() => useShareScore());
    expect(result.current.canShare).toBe(true);

    await result.current.shareScore(512, false);

    expect(share).toHaveBeenCalledWith({
      text: "I scored 512 in 2048! Can you beat me?",
      url: TEST_GAME_URL,
    });
  });

  it("swallows errors when sharing is rejected", async () => {
    const shareAsync = jest.fn().mockRejectedValue(new Error("cancelled"));
    window.FBInstant = { shareAsync } as unknown as typeof window.FBInstant;

    const { result } = renderHook(() => useShareScore());

    await expect(result.current.shareScore(64, false)).resolves.toBeUndefined();
  });
});
