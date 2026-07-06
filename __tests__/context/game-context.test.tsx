import { fireEvent, render } from "@testing-library/react";
import GameProvider from "@/context/game-context";
import Board from "@/components/board";
import Score from "@/components/score";

describe("GameProvider", () => {
  describe("dangling tile references", () => {
    it("does not crash when moving again while a merged tile is animating out", () => {
      jest.useFakeTimers();
      jest.setSystemTime(0);

      try {
        const { container } = render(
          <GameProvider>
            <Board />
          </GameProvider>,
        );

        fireEvent.keyDown(container, { key: "ArrowUp", code: "ArrowUp" });
        expect(container.querySelectorAll(".tile4")).toHaveLength(1);

        jest.setSystemTime(1000);
        expect(() => {
          fireEvent.keyDown(container, { key: "ArrowDown", code: "ArrowDown" });
        }).not.toThrow();

        expect(container.querySelectorAll(".tile").length).toBeGreaterThan(0);
      } finally {
        jest.useRealTimers();
      }
    });
  });

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

  describe("moveTiles", () => {
    it("should move tiles and merge them together", () => {
      const { container } = render(
        <GameProvider>
          <Board />
        </GameProvider>,
      );

      expect(container.querySelectorAll(".tile4")).toHaveLength(0);
      expect(container.querySelectorAll(".tile2")).toHaveLength(2);

      fireEvent.keyDown(container, {
        key: "ArrowUp",
        code: "ArrowUp",
      });

      expect(container.querySelectorAll(".tile4")).toHaveLength(1);
      expect(container.querySelectorAll(".tile2")).toHaveLength(1);
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
