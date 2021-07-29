import { useCallback, useEffect, useReducer, useRef } from "react";
import { animationDuration, size } from "../models/Board";
import { useIds } from "./useIds";

export type TileMeta = {
  id: number;
  position: [number, number];
  value: number;
  mergeWith?: number;
};

type State = {
  tiles: {
    [id: number]: TileMeta;
  };
  inMotion: boolean;
  hasChanged: boolean;
  byIds: number[];
};

const initialState: State = {
  tiles: {},
  byIds: [],
  hasChanged: false,
  inMotion: false,
};

type Action =
  | { type: "CREATE_TILE"; tile: TileMeta }
  | { type: "UPDATE_TILE"; tile: TileMeta }
  | { type: "MERGE_TILE"; source: TileMeta; destination: TileMeta }
  | { type: "START_MOVE" }
  | { type: "END_MOVE" };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "CREATE_TILE":
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [action.tile.id]: action.tile,
        },
        byIds: [...state.byIds, action.tile.id],
        hasChanged: false,
      };
    case "UPDATE_TILE":
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [action.tile.id]: action.tile,
        },
        hasChanged: true,
      };
    case "MERGE_TILE":
      const {
        [action.source.id]: source,
        [action.destination.id]: destination,
        ...restTiles
      } = state.tiles;
      return {
        ...state,
        tiles: {
          ...restTiles,
          [action.destination.id]: {
            id: action.destination.id,
            value: action.source.value + action.destination.value,
            position: action.destination.position,
          },
        },
        byIds: state.byIds.filter((id) => id !== action.source.id),
        hasChanged: true,
      };
    case "START_MOVE":
      return {
        ...state,
        inMotion: true,
      };
    case "END_MOVE":
      return {
        ...state,
        inMotion: false,
      };
    default:
      return state;
  }
};

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();
  // state
  const [state, dispatch] = useReducer(reducer, initialState);
  const { tiles, byIds, hasChanged, inMotion } = state;

  const createTile = useCallback(
    ({ position, value }: Partial<TileMeta>) => {
      const tile = {
        id: nextId(),
        position,
        value,
      } as TileMeta;
      dispatch({ type: "CREATE_TILE", tile });
    },
    [nextId]
  );

  const mergeTile = (source: TileMeta, destination: TileMeta) => {
    dispatch({ type: "MERGE_TILE", source, destination });
  };

  // A must-have to keep the sliding animation if the action merges tiles together.
  const throttledMergeTile = (source: TileMeta, destination: TileMeta) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const updateTile = (tile: TileMeta) => {
    dispatch({ type: "UPDATE_TILE", tile });
  };

  const didTileMove = (source: TileMeta, destination: TileMeta) => {
    const hasXChanged = source.position[0] !== destination.position[0];
    const hasYChanged = source.position[1] !== destination.position[1];

    return hasXChanged || hasYChanged;
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(size * size).fill(0) as number[];

    byIds.forEach((id) => {
      const { position } = tiles[id];
      const index = positionToIndex(position);
      tileMap[index] = id;
    });

    return tileMap;
  }, [byIds, tiles]);

  const findEmptyTiles = useCallback(() => {
    const tileMap = retrieveTileMap();

    const emptyTiles = tileMap.reduce((result, tileId, index) => {
      if (tileId === 0) {
        return [...result, indexToPosition(index) as [number, number]];
      }

      return result;
    }, [] as [number, number][]);

    return emptyTiles;
  }, [retrieveTileMap]);

  const generateRandomTile = useCallback(() => {
    const emptyTiles = findEmptyTiles();

    if (emptyTiles.length > 0) {
      const index = Math.floor(Math.random() * emptyTiles.length);
      const position = emptyTiles[index];

      createTile({ position, value: 2 });
    }
  }, [findEmptyTiles, createTile]);

  const positionToIndex = (position: [number, number]) => {
    return position[1] * size + position[0];
  };

  const indexToPosition = (index: number) => {
    const x = index % size;
    const y = Math.floor(index / size);
    return [x, y];
  };

  const moveLeft = () => {
    const tileMap = retrieveTileMap();

    dispatch({ type: "START_MOVE" });

    for (let index = 0; index < size; index += 1) {
      // TODO make more bulletproof - size might change
      const tileIdsInRow = [
        tileMap[index * size + 0],
        tileMap[index * size + 1],
        tileMap[index * size + 2],
        tileMap[index * size + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      let previousTile: TileMeta | undefined;
      let mergeCount = 0;

      nonEmptyTiles.forEach((tileId, i) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          throttledMergeTile(tile, previousTile);
          previousTile = undefined;
          mergeCount += 1;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          position: indexToPosition(index * size + i - mergeCount),
        } as TileMeta;

        previousTile = tile;

        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }

    // wait until the end of all animations.
    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  const moveRight = () => {
    const tileMap = retrieveTileMap();
    dispatch({ type: "START_MOVE" });

    for (let index = 0; index < size; index += 1) {
      // TODO make more bulletproof - size might change
      const tileIdsInRow = [
        tileMap[index * size + 0],
        tileMap[index * size + 1],
        tileMap[index * size + 2],
        tileMap[index * size + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0).reverse();
      const maxIndex = size - 1;
      let previousTile: TileMeta | undefined;
      let mergeCount = 0;

      nonEmptyTiles.forEach((tileId, i) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          throttledMergeTile(tile, previousTile);
          previousTile = undefined;
          mergeCount += 1;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          position: indexToPosition(index * size + maxIndex + mergeCount - i),
        } as TileMeta;

        previousTile = tile;

        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }

    // wait until the end of all animations.
    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  const moveUp = () => {
    const tileMap = retrieveTileMap();
    dispatch({ type: "START_MOVE" });

    for (let index = 0; index < size; index += 1) {
      // TODO make more bulletproof - size might change
      const tileIdsInColumn = [
        tileMap[index + size * 0],
        tileMap[index + size * 1],
        tileMap[index + size * 2],
        tileMap[index + size * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      let previousTile: TileMeta | undefined;
      let mergeCount = 0;

      nonEmptyTiles.forEach((tileId, i) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          throttledMergeTile(tile, previousTile);
          previousTile = undefined;
          mergeCount += 1;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          position: indexToPosition(index + size * (i - mergeCount)),
        } as TileMeta;
        previousTile = tile;

        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }

    // wait until the end of all animations.
    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  const moveDown = () => {
    const tileMap = retrieveTileMap();
    dispatch({ type: "START_MOVE" });

    for (let index = 0; index < size; index += 1) {
      // TODO make more bulletproof - size might change
      const tileIdsInColumn = [
        tileMap[index + size * 0],
        tileMap[index + size * 1],
        tileMap[index + size * 2],
        tileMap[index + size * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0).reverse();
      const maxIndex = size - 1;

      let previousTile: TileMeta | undefined;
      let mergeCount = 0;

      nonEmptyTiles.forEach((tileId, i) => {
        const currentTile = tiles[tileId];

        if (
          previousTile !== undefined &&
          previousTile.value === currentTile.value
        ) {
          const tile = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          } as TileMeta;

          throttledMergeTile(tile, previousTile);
          previousTile = undefined;
          mergeCount += 1;
          return updateTile(tile);
        }

        const tile = {
          ...currentTile,
          position: indexToPosition(index + size * (maxIndex - i + mergeCount)),
        } as TileMeta;

        previousTile = tile;

        if (didTileMove(currentTile, tile)) {
          return updateTile(tile);
        }
      });
    }
    // wait until the end of all animations.
    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  useEffect(() => {
    if (isInitialRender.current) {
      createTile({ position: [0, 1], value: 2 });
      createTile({ position: [0, 2], value: 2 });
      isInitialRender.current = false;
      return;
    }

    if (!inMotion && hasChanged) {
      generateRandomTile();
    }
  }, [hasChanged, inMotion, createTile, generateRandomTile]);

  const tileList = byIds.map((tileId) => tiles[tileId]);
  return [tileList, moveLeft, moveRight, moveUp, moveDown] as [
    TileMeta[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
