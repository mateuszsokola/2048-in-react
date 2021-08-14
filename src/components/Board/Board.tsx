import React from "react";
import { BoardProvider } from "./context/BoardContext";
import { boardMargin, tileCount as defaultTileCount } from "./models/Board";
import { Grid } from "../Grid";
import { TileMeta, tileTotalWidth, Tile } from "../Tile";
import "./board.less";

type Props = {
  tiles: TileMeta[];
  tileCountPerRow: number;
};

export const Board = ({ tiles, tileCountPerRow = defaultTileCount }: Props) => {
  const containerWidth = tileTotalWidth * tileCountPerRow;
  const boardWidth = containerWidth + boardMargin;

  const tileList = tiles.map(({ id, ...restProps }) => (
    <Tile key={`tile-${id}`} {...restProps} zIndex={id} />
  ));

  return (
    <div className="board" style={{ width: boardWidth }}>
      <BoardProvider
        containerWidth={containerWidth}
        tileCount={tileCountPerRow}
      >
        <div className="tile-container">{tileList}</div>
        <Grid />
      </BoardProvider>
    </div>
  );
};
