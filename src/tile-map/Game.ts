import { BrushScene } from "./BrushScene";
import { CursorScene } from "./CursorScene";
import { GridScene } from "./GridScene";
import { MainScene } from "./MainScene";

export function createGame() {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [MainScene, GridScene, CursorScene, BrushScene],
  });
}
