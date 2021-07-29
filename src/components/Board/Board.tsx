import React, { useEffect, useRef, useState } from "react";
import { useThrottledCallback } from "use-debounce";
import { TileContainer } from "../../context/TileContainer";
import { useGame } from "../../hooks/useGame";
import { animationDuration } from "../../models/Board";
import { Grid } from "../Grid";
import { Tile } from "../Tile";
import "./board.less";

export const Board = () => {
  const tileManagerRef = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(0);
  const [tiles, moveLeft, moveRight, moveUp, moveDown] = useGame();

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowLeft":
        moveLeft();
        break;
      case "ArrowRight":
        moveRight();
        break;
      case "ArrowUp":
        moveUp();
        break;
      case "ArrowDown":
        moveDown();
        break;
    }
  };
  // protects the reducer from being flooded with events.
  const throttledHandleKeyDown = useThrottledCallback(
    handleKeyDown,
    animationDuration,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    if (tileManagerRef.current !== null) {
      setLength((tileManagerRef.current as HTMLDivElement).offsetWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", throttledHandleKeyDown);

    return () => {
      window.removeEventListener("keydown", throttledHandleKeyDown);
    };
  }, [throttledHandleKeyDown]);

  const renderTiles = () => {
    if (length === 0) {
      return null;
    }

    const tileList = tiles.map(({ id, ...restProps }) => (
      <Tile key={`tile-${id}`} {...restProps} zIndex={id} />
    ));

    return <>{tileList}</>;
  };

  return (
    <div className="board">
      <TileContainer length={length}>
        <div className="tile-container" ref={tileManagerRef}>
          {renderTiles()}
        </div>
      </TileContainer>
      <Grid />
    </div>
  );
};
