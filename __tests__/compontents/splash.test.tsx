import { render, screen, fireEvent } from "@testing-library/react";
import GameProvider from "@/context/game-context";
import Splash from "@/components/splash";
import useShareScore from "@/hooks/use-share-score";

jest.mock("@/hooks/use-share-score");

const mockedUseShareScore = useShareScore as jest.MockedFunction<
  typeof useShareScore
>;

describe("Splash", () => {
  afterEach(() => jest.clearAllMocks());

  it("hides the share button when sharing is unavailable", () => {
    mockedUseShareScore.mockReturnValue({
      canShare: false,
      shareScore: jest.fn(),
    });

    render(
      <GameProvider>
        <Splash heading="Game over!" type="lost" />
      </GameProvider>,
    );

    expect(screen.queryByText("Share score")).not.toBeInTheDocument();
  });

  it("shows the share button and shares the score when available", () => {
    const shareScore = jest.fn().mockResolvedValue(undefined);
    mockedUseShareScore.mockReturnValue({ canShare: true, shareScore });

    render(
      <GameProvider>
        <Splash heading="You won!" type="won" />
      </GameProvider>,
    );

    fireEvent.click(screen.getByText("Share score"));

    expect(shareScore).toHaveBeenCalledWith(0, true);
  });
});
