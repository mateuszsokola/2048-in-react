import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { isNil, throttle } from "lodash";
import { mergeAnimationDuration, tileCountPerDimension } from "@/constants";
import { Tile } from "@/models/tile";
import gameReducer, { initialState } from "@/reducers/game-reducer";

type MoveDirection = "move_up" | "move_down" | "move_left" | "move_right";

export const GameContext = createContext({
  score: 0,
  moveTiles: (_: MoveDirection) => {},
  getTiles: () => [] as Tile[],
  startGame: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const getEmptyCells = () => {
    const results: [number, number][] = [];

    for (let x = 0; x < tileCountPerDimension; x++) {
      for (let y = 0; y < tileCountPerDimension; y++) {
        if (isNil(gameState.board[y][x])) {
          results.push([x, y]);
        }
      }
    }
    return results;
  };

  const appendRandomTile = () => {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
      const cellIndex = Math.floor(Math.random() * emptyCells.length);
      const newTile = {
        position: emptyCells[cellIndex],
        value: 2,
      };
      dispatch({ type: "create_tile", tile: newTile });
    }
  };

  const getTiles = () => {
    return gameState.tilesByIds.map((tileId) => gameState.tiles[tileId]);
  };

  const moveTiles = useCallback(
    throttle(
      (type: MoveDirection) => dispatch({ type }),
      mergeAnimationDuration * 1.05,
      { trailing: false },
    ),
    [dispatch],
  );

  const startGame = () => {
    dispatch({ type: "create_tile", tile: { position: [0, 1], value: 2 } });
    dispatch({ type: "create_tile", tile: { position: [0, 2], value: 2 } });
  };

  useEffect(() => {
    if (gameState.hasChanged) {
      setTimeout(() => {
        dispatch({ type: "clean_up" });
        appendRandomTile();
      }, mergeAnimationDuration);
    }
  }, [gameState.hasChanged]);

  return (
    <GameContext.Provider
      value={{
        score: gameState.score,
        getTiles,
        moveTiles,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
