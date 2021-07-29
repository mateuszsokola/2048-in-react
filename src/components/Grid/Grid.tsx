import React from "react";

import { size } from "../../models/Board";

import "./grid.less";

export const Grid = () => {
  const renderGrid = () => {
    const length = size * size;
    const cells = [] as JSX.Element[];

    for (let index = 0; index < length; index += 1) {
      cells.push(<div key={`${index}`} className={`grid-cell`} />);
    }

    return cells;
  };

  return <div className="grid">{renderGrid()}</div>;
};
