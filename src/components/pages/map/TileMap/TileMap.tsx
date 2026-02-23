import { useEffect, useRef } from "react";

import { MainScene } from "@tile-map/MainScene";
import Phaser from "phaser";
import type { RootState } from "@/store";
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
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-container",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: "arcade" },
      pixelArt: true,
      scene: MainScene,
    });

    return () => gameRef.current?.destroy(true);
  }, []);

  return (
    <div className={styles.base}>
      <div id="game-container" className={styles.canvas} title={title}></div>
    </div>
  );
}
