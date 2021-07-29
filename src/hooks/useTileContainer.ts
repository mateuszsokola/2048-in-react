import { useContext } from "react";
import { TileContainerContext } from "../context/TileContainer";

/**
 * Returns the data of the Tile Container.
 *
 * @returns {number}
 */
export const useTileContainer = () => {
  const { length } = useContext(TileContainerContext);

  return [length] as [number];
};
