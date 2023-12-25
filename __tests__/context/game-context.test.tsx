import { fireEvent, render } from "@testing-library/react";
import Board from "@/components/board";
import Score from "@/components/score";
import GameProvider from "@/context/game-context";

describe("GameProvider", () => {
  describe("startGame", () => {
    it("should start the game with two tiles", () => {
      const { container } = render(
        <GameProvider>
          <Board />
        </GameProvider>,
      );

      expect(container.querySelectorAll(".tile")).toHaveLength(2);
    });
  });

  describe("getTiles", () => {
    it("should return tiles", () => {
      const { container } = render(
        <GameProvider>
          <Board />
        </GameProvider>,
      );

      expect(container.querySelectorAll(".tile")).toHaveLength(2);
    });
  });

  describe("score", () => {
    it("should return score", () => {
      const { container } = render(
        <GameProvider>
          <Score />
          <Board />
        </GameProvider>,
      );

      expect(container.querySelector(".score > div")?.textContent).toEqual("0");
    });

    it("should refresh score after move", () => {
      const { container } = render(
        <GameProvider>
          <Score />
          <Board />
        </GameProvider>,
      );

      expect(container.querySelector(".score > div")?.textContent).toEqual("0");

      fireEvent.keyDown(container, {
        key: "ArrowUp",
        code: "ArrowUp",
      });

      expect(container.querySelector(".score > div")?.textContent).toEqual("4");
    });
  });
});
