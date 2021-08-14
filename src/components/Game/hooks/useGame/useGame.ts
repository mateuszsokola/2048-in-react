import { useCallback, useEffect, useReducer, useRef } from "react";
import { animationDuration, tileCount } from "../../../Board";
import { TileMeta } from "../../../Tile";
import { useIds } from "../useIds";
import { GameReducer, initialState } from "./reducer";

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();
  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
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
    const tileMap = new Array(tileCount * tileCount).fill(0) as number[];

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
    return position[1] * tileCount + position[0];
  };

  const indexToPosition = (index: number) => {
    const x = index % tileCount;
    const y = Math.floor(index / tileCount);
    return [x, y];
  };

  type RetrieveNonEmptyTilesInRowColumnCallback = (
    tileMap: number[],
    tileIndex: number
  ) => number[];

  type CalculateTileIndex = (
    tileIndex: number,
    tileInRowIndex: number,
    mergedCount: number,
    maxIndexInRow: number
  ) => number;

  const move = (
    retrieveNonEmptyTiles: RetrieveNonEmptyTilesInRowColumnCallback,
    calculateTileIndex: CalculateTileIndex
  ) => {
    const tileMap = retrieveTileMap();

    dispatch({ type: "START_MOVE" });

    const maxIndex = tileCount - 1;

    for (let tileIndex = 0; tileIndex < tileCount; tileIndex += 1) {
      const nonEmptyTiles = retrieveNonEmptyTiles(tileMap, tileIndex);
      let previousTile: TileMeta | undefined;
      let mergeCount = 0;

      nonEmptyTiles.forEach((tileId, nonEmptyTileIndex) => {
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
          position: indexToPosition(
            calculateTileIndex(
              tileIndex,
              nonEmptyTileIndex,
              mergeCount,
              maxIndex
            )
          ),
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

  const moveLeftFactory = () => {
    const retrieveNonEmptyTiles = (tileMap: number[], tileIndex: number) => {
      const tileIdsInRow = [
        tileMap[tileIndex * tileCount + 0],
        tileMap[tileIndex * tileCount + 1],
        tileMap[tileIndex * tileCount + 2],
        tileMap[tileIndex * tileCount + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateTileIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      mergedCount: number,
      _: number
    ) => {
      return tileIndex * tileCount + tileInRowIndex - mergedCount;
    };

    return move.bind(this, retrieveNonEmptyTiles, calculateTileIndex);
  };

  const moveRightFactory = () => {
    const retrieveNonEmptyTiles = (tileMap: number[], tileIndex: number) => {
      const tileIdsInRow = [
        tileMap[tileIndex * tileCount + 0],
        tileMap[tileIndex * tileCount + 1],
        tileMap[tileIndex * tileCount + 2],
        tileMap[tileIndex * tileCount + 3],
      ];

      const nonEmptyTiles = tileIdsInRow.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateTileIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      mergedCount: number,
      maxIndexInRow: number
    ) => {
      return (
        tileIndex * tileCount + maxIndexInRow + mergedCount - tileInRowIndex
      );
    };

    return move.bind(this, retrieveNonEmptyTiles, calculateTileIndex);
  };

  const moveUpFactory = () => {
    const retrieveNonEmptyTiles = (tileMap: number[], tileIndex: number) => {
      const tileIdsInColumn = [
        tileMap[tileIndex + tileCount * 0],
        tileMap[tileIndex + tileCount * 1],
        tileMap[tileIndex + tileCount * 2],
        tileMap[tileIndex + tileCount * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles;
    };

    const calculateTileIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      mergedCount: number,
      _: number
    ) => {
      return tileIndex + tileCount * (tileInRowIndex - mergedCount);
    };

    return move.bind(this, retrieveNonEmptyTiles, calculateTileIndex);
  };

  const moveDownFactory = () => {
    const retrieveNonEmptyTiles = (tileMap: number[], tileIndex: number) => {
      const tileIdsInColumn = [
        tileMap[tileIndex + tileCount * 0],
        tileMap[tileIndex + tileCount * 1],
        tileMap[tileIndex + tileCount * 2],
        tileMap[tileIndex + tileCount * 3],
      ];

      const nonEmptyTiles = tileIdsInColumn.filter((id) => id !== 0);
      return nonEmptyTiles.reverse();
    };

    const calculateTileIndex = (
      tileIndex: number,
      tileInRowIndex: number,
      mergedCount: number,
      maxIndexInRow: number
    ) => {
      return (
        tileIndex + tileCount * (maxIndexInRow - tileInRowIndex + mergedCount)
      );
    };

    return move.bind(this, retrieveNonEmptyTiles, calculateTileIndex);
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

  const moveLeft = moveLeftFactory();
  const moveRight = moveRightFactory();
  const moveUp = moveUpFactory();
  const moveDown = moveDownFactory();

  return [tileList, moveLeft, moveRight, moveUp, moveDown] as [
    TileMeta[],
    () => void,
    () => void,
    () => void,
    () => void
  ];
};
