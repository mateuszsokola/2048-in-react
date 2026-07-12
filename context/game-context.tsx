import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { isNil, throttle } from "lodash";
import {
  gameWinTileValue,
  mergeAnimationDuration,
  tileCountPerDimension,
} from "@/constants";
import { Tile } from "@/models/tile";
import gameReducer, {
  initialState,
  State,
  Action,
} from "@/reducers/game-reducer";

type MoveDirection = "move_up" | "move_down" | "move_left" | "move_right";

export const GameContext = createContext({
  score: 0,
  status: "ongoing",
  moveTiles: (_: MoveDirection) => {},
  getTiles: () => [] as Tile[],
  startGame: () => {},
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [gameState, dispatch] = useReducer(
    (state: State, action: Action) => gameReducer(state, action),
    initialState,
  );

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
    return gameState.tilesByIds
      .map((tileId) => gameState.tiles[tileId])
      .filter((tile) => !isNil(tile));
  };

  const isBoardSettled = gameState.tilesByIds.every(
    (tileId) => !isNil(gameState.tiles[tileId]),
  );
  const isBoardSettledRef = useRef(isBoardSettled);
  isBoardSettledRef.current = isBoardSettled;

  const moveTiles = useCallback(
    throttle(
      (type: MoveDirection) => {
        if (!isBoardSettledRef.current) {
          return;
        }
        dispatch({ type });
      },
      mergeAnimationDuration * 1.05,
      { trailing: false },
    ),
    [dispatch],
  );

  const startGame = () => {
    dispatch({ type: "reset_game" });
    dispatch({ type: "create_tile", tile: { position: [0, 1], value: 2 } });
    dispatch({ type: "create_tile", tile: { position: [0, 2], value: 2 } });
  };

  const checkGameState = () => {
    const isWon =
      Object.values(gameState.tiles).filter((t) => t.value === gameWinTileValue)
        .length > 0;

    if (isWon) {
      dispatch({ type: "update_status", status: "won" });
      return;
    }

    const { tiles, board } = gameState;

    const maxIndex = tileCountPerDimension - 1;
    for (let x = 0; x <= maxIndex; x += 1) {
      for (let y = 0; y <= maxIndex; y += 1) {
        // An empty cell means a move is still possible.
        if (isNil(board[x][y])) {
          return;
        }

        // An empty right neighbour is a move; an equal one can be merged.
        if (x < maxIndex) {
          const right = board[x + 1][y];
          if (isNil(right) || tiles[board[x][y]].value === tiles[right].value) {
            return;
          }
        }

        // An empty bottom neighbour is a move; an equal one can be merged.
        if (y < maxIndex) {
          const bottom = board[x][y + 1];
          if (
            isNil(bottom) ||
            tiles[board[x][y]].value === tiles[bottom].value
          ) {
            return;
          }
        }
      }
    }

    dispatch({ type: "update_status", status: "lost" });
  };

  useEffect(() => {
    if (gameState.hasChanged) {
      setTimeout(() => {
        dispatch({ type: "clean_up" });
        appendRandomTile();
      }, mergeAnimationDuration);
    }
  }, [gameState.hasChanged]);

  useEffect(() => {
    if (!gameState.hasChanged) {
      checkGameState();
    }
  }, [gameState.hasChanged]);

  return (
    <GameContext.Provider
      value={{
        score: gameState.score,
        status: gameState.status,
        getTiles,
        moveTiles,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
