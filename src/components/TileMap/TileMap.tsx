import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "@tile-map/MainScene";

export function TileMap() {
  const gameRef = useRef<Phaser.Game | null>(null);

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

  return <div id="game-container"></div>;
}
