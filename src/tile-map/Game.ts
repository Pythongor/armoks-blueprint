import { BrushScene } from "./scenes/BrushScene";
import { CursorScene } from "./scenes/CursorScene";
import { GridScene } from "./scenes/GridScene";
import { LineScene } from "./scenes/LineScene";
import { MainScene } from "./scenes/MainScene";

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
    scene: [MainScene, GridScene, CursorScene, BrushScene, LineScene],
  });
}
