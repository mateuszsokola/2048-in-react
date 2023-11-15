import { isNil } from "lodash";
import { uid } from "uid";
import { tileCountPerDimension } from "@/constants";
import { Tile, TileMap } from "@/models/tile";

type State = { board: string[][]; tiles: TileMap };
type Action =
  | { type: "create_tile"; tile: Tile }
  | { type: "move_up" }
  | { type: "move_down" }
  | { type: "move_left" }
  | { type: "move_right" };

function createBoard() {
  const board: string[][] = [];

  for (let i = 0; i < tileCountPerDimension; i += 1) {
    board[i] = new Array(tileCountPerDimension).fill(undefined);
  }

  return board;
}

export const initialState: State = { board: createBoard(), tiles: {} };

export default function gameReducer(
  state: State = initialState,
  action: Action,
) {
  switch (action.type) {
    case "create_tile": {
      const tileId = uid();
      const [x, y] = action.tile.position;
      const newBoard = JSON.parse(JSON.stringify(state.board));
      newBoard[y][x] = tileId;

      return {
        ...state,
        board: newBoard,
        tiles: {
          ...state.tiles,
          [tileId]: action.tile,
        },
      };
    }
    case "move_up": {
      const newBoard = createBoard();
      const newTiles: TileMap = {};

      for (let x = 0; x < tileCountPerDimension; x++) {
        let newY = 0;

        for (let y = 0; y < tileCountPerDimension; y++) {
          const tileId = state.board[y][x];
          if (!isNil(tileId)) {
            newBoard[newY][x] = tileId;
            newTiles[tileId] = {
              ...state.tiles[tileId],
              position: [x, newY],
            };
            newY++;
          }
        }
      }

      return {
        ...state,
        board: newBoard,
        tiles: newTiles,
      };
    }
    case "move_down": {
      const newBoard = createBoard();
      const newTiles: TileMap = {};

      for (let x = 0; x < tileCountPerDimension; x++) {
        let newY = tileCountPerDimension - 1;

        for (let y = 0; y < tileCountPerDimension; y++) {
          const tileId = state.board[y][x];
          if (!isNil(tileId)) {
            newBoard[newY][x] = tileId;
            newTiles[tileId] = {
              ...state.tiles[tileId],
              position: [x, newY],
            };
            newY--;
          }
        }
      }

      return {
        ...state,
        board: newBoard,
        tiles: newTiles,
      };
    }
    case "move_left": {
      const newBoard = createBoard();
      const newTiles: TileMap = {};

      for (let y = 0; y < tileCountPerDimension; y++) {
        let newX = 0;

        for (let x = 0; x < tileCountPerDimension; x++) {
          const tileId = state.board[y][x];
          if (!isNil(tileId)) {
            newBoard[y][newX] = tileId;
            newTiles[tileId] = {
              ...state.tiles[tileId],
              position: [newX, y],
            };
            newX++;
          }
        }
      }

      return {
        ...state,
        board: newBoard,
        tiles: newTiles,
      };
    }
    case "move_right": {
      const newBoard = createBoard();
      const newTiles: TileMap = {};

      for (let y = 0; y < tileCountPerDimension; y++) {
        let newX = tileCountPerDimension - 1;

        for (let x = 0; x < tileCountPerDimension; x++) {
          const tileId = state.board[y][x];
          if (!isNil(tileId)) {
            newBoard[y][newX] = tileId;
            newTiles[tileId] = {
              ...state.tiles[tileId],
              position: [newX, y],
            };
            newX--;
          }
        }
      }

      return {
        ...state,
        board: newBoard,
        tiles: newTiles,
      };
    }
    default:
      return state;
  }
}
