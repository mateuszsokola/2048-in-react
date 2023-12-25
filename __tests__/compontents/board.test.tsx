import { render } from "@testing-library/react";
import Board from "@/components/board";
import GameProvider from "@/context/game-context";

describe("Board", () => {
  it("should render board with 16 cells", () => {
    const { container } = render(
      <GameProvider>
        <Board />
      </GameProvider>,
    );
    const cellElements = container.querySelectorAll(".cell");

    expect(cellElements.length).toEqual(16);
  });

  it("should render board with 2 tiles", async () => {
    const { container } = render(
      <GameProvider>
        <Board />
      </GameProvider>,
    );
    const tiles = container.querySelectorAll(".tile");

    expect(tiles.length).toEqual(2);
  });
});
