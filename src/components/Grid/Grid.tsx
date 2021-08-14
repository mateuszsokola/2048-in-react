import React from "react";
import { useBoard } from "../Board";

import "./grid.less";

export const Grid = () => {
  const [, tileCount] = useBoard();

  const renderGrid = () => {
    const length = tileCount * tileCount;
    const cells = [] as JSX.Element[];

    for (let index = 0; index < length; index += 1) {
      cells.push(<div key={`${index}`} className={`grid-cell`} />);
    }

    return cells;
  };

  return <div className="grid">{renderGrid()}</div>;
};
