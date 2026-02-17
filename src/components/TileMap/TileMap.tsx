import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "@tile-map/MainScene";
import styles from "./TileMap.module.scss";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function TileMap() {
  const { x, y, biome } = useSelector((state: RootState) => state.coords);
  const gameRef = useRef<Phaser.Game | null>(null);

  const title = `${x}:${y} - ${biome}`;

  useEffect(() => {
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-container",
      width: 800,
      height: 600,
      scene: MainScene,
    });

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div id="game-container" className={styles.base} title={title}></div>;
}
