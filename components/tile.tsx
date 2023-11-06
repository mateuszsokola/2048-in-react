import { containerWidth, tileCountPerDimension } from "@/constants";
import { Tile as TileProps } from "@/models/tile";
import styles from "@/styles/tile.module.css";

export default function Tile({ position, value }: TileProps) {
  const positionToPixels = (position: number) => {
    return (position / tileCountPerDimension) * containerWidth;
  };

  const style = {
    left: positionToPixels(position[0]),
    top: positionToPixels(position[1]),
  };
  return (
    <div className={styles.tile} style={style}>
      {value}
    </div>
  );
}
