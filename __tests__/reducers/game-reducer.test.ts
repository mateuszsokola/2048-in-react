import { Tile } from "@/models/tile";
import gameReducer, { initialState } from "@/reducers/game-reducer";
import { act, renderHook } from "@testing-library/react";
import { isNil } from "lodash";
import { useReducer } from "react";

describe("gameReducer", () => {
  describe("clean_up", () => {
    it("should clean up unused tiles after two tiles get merged together", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
        dispatch({ type: "move_up" });
      });

      const [stateBefore] = result.current;
      expect(Object.values(stateBefore.tiles)).toHaveLength(2);
      expect(stateBefore.tilesByIds).toHaveLength(2);

      act(() => dispatch({ type: "clean_up" }));

      const [stateAfter] = result.current;
      expect(Object.values(stateAfter.tiles)).toHaveLength(1);
      expect(stateAfter.tilesByIds).toHaveLength(1);
    });
  });
  describe("create_tile", () => {
    it("should create a new tile", () => {
      const tile: Tile = {
        position: [0, 0],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => dispatch({ type: "create_tile", tile }));

      const [state] = result.current;

      const tileId = state.board[0][0];
      expect(tileId).toBeDefined();
      expect(Object.values(state.tiles)).toEqual([{ id: tileId, ...tile }]);
      expect(state.tilesByIds).toEqual([tileId]);
    });

    it("should append tile id to the tile model", () => {
      const tile: Tile = {
        position: [0, 0],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => dispatch({ type: "create_tile", tile }));

      const [state] = result.current;

      const tileId = state.board[0][0];
      expect(state.tiles[tileId].id).toBeDefined();
    });
  });

  describe("move_up", () => {
    it("should move tiles to the top of the board", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [1, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(isNil(stateBefore.board[0][1])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(typeof stateBefore.board[3][1]).toBe("string");

      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_up" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[0][0]).toBe("string");
      expect(typeof stateAfter.board[0][1]).toBe("string");
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[3][1])).toBeTruthy();

      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should stack tiles with the same values on top of each other", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(isNil(stateBefore.board[2][0])).toBeTruthy();
      expect(typeof stateBefore.board[3][0]).toBe("string");

      act(() => dispatch({ type: "move_up" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[0][0]).toBe("string");
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[2][0])).toBeTruthy();
      expect(isNil(stateAfter.board[3][0])).toBeTruthy();
    });

    it("should merge tiles with the same values", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(2);
      expect(isNil(stateBefore.board[2][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[3][0]].value).toBe(2);
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_up" }));

      const [stateAfter] = result.current;
      expect(stateAfter.tiles[stateAfter.board[0][0]].value).toBe(4);
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[2][0])).toBeTruthy();
      expect(isNil(stateAfter.board[3][0])).toBeTruthy();
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should keep hasChanged falsy if no tile changed position or value", () => {
      const tile1: Tile = {
        position: [0, 0],
        value: 4,
      };
      const tile2: Tile = {
        position: [0, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
        dispatch({ type: "move_up" });
      });

      const [stateAfter] = result.current;
      expect(stateAfter.hasChanged).toBeFalsy();
    });
  });

  describe("move_down", () => {
    it("should move tiles to the bottom of the board", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [1, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[3][0])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(typeof stateBefore.board[3][1]).toBe("string");
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_down" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[3][0]).toBe("string");
      expect(typeof stateAfter.board[3][1]).toBe("string");
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should stack tiles with the same values on top of each other", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(isNil(stateBefore.board[2][0])).toBeTruthy();
      expect(typeof stateBefore.board[3][0]).toBe("string");

      act(() => dispatch({ type: "move_down" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[0][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[2][0])).toBeTruthy();
      expect(typeof stateAfter.board[3][0]).toBe("string");
    });

    it("should merge tiles with the same values", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(2);
      expect(isNil(stateBefore.board[2][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[3][0]].value).toBe(2);
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_down" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[0][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[2][0])).toBeTruthy();
      expect(stateAfter.tiles[stateAfter.board[3][0]].value).toBe(4);
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should keep hasChanged falsy if no tile changed position or value", () => {
      const tile1: Tile = {
        position: [0, 3],
        value: 2,
      };
      const tile2: Tile = {
        position: [1, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
        dispatch({ type: "move_down" });
      });

      expect(result.current[0].hasChanged).toBeFalsy();
    });

    it("should keep the original order of tiles (regression test)", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 4,
      };
      const tile2: Tile = {
        position: [0, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[0][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(4);
      expect(isNil(stateBefore.board[2][0])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[3][0]].value).toBe(2);

      act(() => dispatch({ type: "move_down" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[0][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(stateAfter.tiles[stateAfter.board[2][0]].value).toBe(4);
      expect(stateAfter.tiles[stateAfter.board[3][0]].value).toBe(2);
    });
  });

  describe("move_left", () => {
    it("should move tiles to the left side of the board", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [1, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[3][0])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(typeof stateBefore.board[3][1]).toBe("string");
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_left" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[1][0]).toBe("string");
      expect(typeof stateAfter.board[3][0]).toBe("string");
      expect(isNil(stateAfter.board[3][1])).toBeTruthy();
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should stack tiles with the same values on top of each other", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(isNil(stateBefore.board[1][1])).toBeTruthy();
      expect(isNil(stateBefore.board[1][2])).toBeTruthy();
      expect(typeof stateBefore.board[1][3]).toBe("string");

      act(() => dispatch({ type: "move_left" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[1][0]).toBe("string");
      expect(isNil(stateAfter.board[1][1])).toBeTruthy();
      expect(isNil(stateAfter.board[1][2])).toBeTruthy();
      expect(isNil(stateAfter.board[1][3])).toBeTruthy();
    });

    it("should merge tiles with the same values", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(2);
      expect(isNil(stateBefore.board[1][1])).toBeTruthy();
      expect(isNil(stateBefore.board[1][2])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][3]].value).toBe(2);
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_left" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[1][0]).toBe("string");
      expect(stateAfter.tiles[stateAfter.board[1][0]].value).toBe(4);
      expect(isNil(stateAfter.board[1][1])).toBeTruthy();
      expect(isNil(stateAfter.board[1][2])).toBeTruthy();
      expect(isNil(stateAfter.board[1][3])).toBeTruthy();
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should keep hasChanged falsy if no tile changed position or value", () => {
      const tile1: Tile = {
        position: [0, 0],
        value: 2,
      };
      const tile2: Tile = {
        position: [0, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
        dispatch({ type: "move_left" });
      });

      expect(result.current[0].hasChanged).toBeFalsy();
    });
  });

  describe("move_right", () => {
    it("should move tiles to the right side of the board", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [1, 3],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(isNil(stateBefore.board[1][3])).toBeTruthy();
      expect(isNil(stateBefore.board[3][3])).toBeTruthy();
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(typeof stateBefore.board[3][1]).toBe("string");
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_right" }));

      const [stateAfter] = result.current;
      expect(typeof stateAfter.board[1][3]).toBe("string");
      expect(typeof stateAfter.board[3][3]).toBe("string");
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[3][1])).toBeTruthy();
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should stack tiles with the same values on top of each other", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(typeof stateBefore.board[1][0]).toBe("string");
      expect(isNil(stateBefore.board[1][1])).toBeTruthy();
      expect(isNil(stateBefore.board[1][2])).toBeTruthy();
      expect(typeof stateBefore.board[1][3]).toBe("string");

      act(() => dispatch({ type: "move_right" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][1])).toBeTruthy();
      expect(isNil(stateAfter.board[1][2])).toBeTruthy();
      expect(typeof stateAfter.board[1][3]).toBe("string");
    });

    it("should merge tiles with the same values", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 2,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(2);
      expect(isNil(stateBefore.board[1][1])).toBeTruthy();
      expect(isNil(stateBefore.board[1][2])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][3]].value).toBe(2);
      expect(stateBefore.hasChanged).toBeFalsy();

      act(() => dispatch({ type: "move_right" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][1])).toBeTruthy();
      expect(isNil(stateAfter.board[1][2])).toBeTruthy();
      expect(stateAfter.tiles[stateAfter.board[1][3]].value).toBe(4);
      expect(stateAfter.hasChanged).toBeTruthy();
    });

    it("should keep hasChanged falsy if no tile changed position or value", () => {
      const tile1: Tile = {
        position: [3, 0],
        value: 2,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
        dispatch({ type: "move_right" });
      });

      expect(result.current[0].hasChanged).toBeFalsy();
    });

    it("keep the original order of tiles (regression test)", () => {
      const tile1: Tile = {
        position: [0, 1],
        value: 4,
      };
      const tile2: Tile = {
        position: [3, 1],
        value: 2,
      };

      const { result } = renderHook(() =>
        useReducer(gameReducer, initialState),
      );
      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: "create_tile", tile: tile1 });
        dispatch({ type: "create_tile", tile: tile2 });
      });

      const [stateBefore] = result.current;
      expect(stateBefore.tiles[stateBefore.board[1][0]].value).toBe(4);
      expect(isNil(stateBefore.board[1][1])).toBeTruthy();
      expect(isNil(stateBefore.board[1][2])).toBeTruthy();
      expect(stateBefore.tiles[stateBefore.board[1][3]].value).toBe(2);

      act(() => dispatch({ type: "move_right" }));

      const [stateAfter] = result.current;
      expect(isNil(stateAfter.board[1][0])).toBeTruthy();
      expect(isNil(stateAfter.board[1][1])).toBeTruthy();
      expect(stateAfter.tiles[stateAfter.board[1][2]].value).toBe(4);
      expect(stateAfter.tiles[stateAfter.board[1][3]].value).toBe(2);
    });
  });
});
