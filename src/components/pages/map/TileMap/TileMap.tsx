import { useEffect, useRef } from "react";

import Phaser from "phaser";
import type { RootState } from "@/store";
import { createGame } from "@/tile-map/Game";
import { formatBiomeText } from "@helpers/biomeResolver";
import styles from "./TileMap.module.scss";
import { useSelector } from "react-redux";

export function TileMap() {
  const { x, y, biome, biomeDescriptor } = useSelector(
    (state: RootState) => state.coords,
  );
  const gameRef = useRef<Phaser.Game | null>(null);

  const biomeText = formatBiomeText(biome);
  const title = `${x}:${y} - ${biomeDescriptor} ${biomeText}`;

  useEffect(() => {
    gameRef.current = createGame();

    return () => gameRef.current?.destroy(true);
  }, []);

  return (
    <div className={styles.base}>
      <div id="game-container" className={styles.canvas} title={title}></div>
    </div>
  );
}
