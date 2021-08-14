import { pixelSize } from "../../../styles";

export type TileMeta = {
  id: number;
  position: [number, number];
  value: number;
  mergeWith?: number;
};

const tileMargin = 2 * pixelSize;

const tileWidthMultiplier = 12.5;

const tileWidth = tileWidthMultiplier * pixelSize;

export const tileTotalWidth = tileWidth + tileMargin;
