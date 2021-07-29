import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { usePrevProps } from "../../hooks/usePrevProps";
import { useTileContainer } from "../../hooks/useTileContainer";
import { size } from "../../models/Board";
import "./tile.less";

type Props = {
  value: number;
  position: [number, number];
  zIndex: number;
};

export const Tile = ({ value, position, zIndex }: Props) => {
  const withinBoardBoundaries = position[0] < size && position[1] < size;
  invariant(withinBoardBoundaries, "Tile out of bound");

  const [scale, setScale] = useState(1);

  const [boardLength] = useTileContainer();
  const prevValue = usePrevProps<number>(value);
  const prevCoords = usePrevProps<[number, number]>(position);

  const isNew = prevCoords === undefined;
  const hasChanged = prevValue !== value;
  const shallAnimate = isNew || hasChanged;

  useEffect(() => {
    if (shallAnimate) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [shallAnimate, scale]);

  const positionToPixels = (position: number) => {
    return (position / size) * (boardLength as number);
  };

  const style = {
    top: positionToPixels(position[1]),
    left: positionToPixels(position[0]),
    transform: `scale(${scale})`,
    zIndex,
  };

  return (
    <div className={`tile tile-${value}`} style={style}>
      {value}
    </div>
  );
};
