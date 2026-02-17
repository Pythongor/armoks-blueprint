import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "@tile-map/MainScene";
import styles from "./TileMap.module.scss";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function TileMap() {
  const { x, y, biome, biomeDescriptor } = useSelector(
    (state: RootState) => state.coords,
  );
  const gameRef = useRef<Phaser.Game | null>(null);

  const title = `${x}:${y} - ${biomeDescriptor} ${biome}`;

  useEffect(() => {
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-container",
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: "100%",
        height: "100%",
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
