import Phaser from "phaser";
import { EventBus } from "./EventBus";

export const BrushType = {
  Water: 0,
  Grass: 1,
} as const;

export type BrushTypeValue = (typeof BrushType)[keyof typeof BrushType];

const TILE_COLORS: Record<BrushTypeValue, number> = {
  [BrushType.Water]: 0x4169e1, // Royal Blue
  [BrushType.Grass]: 0x228b22, // Forest Green
} as const;

export class MainScene extends Phaser.Scene {
  private currentBrush: BrushTypeValue = BrushType.Water;

  // 129x129 grid (Standard DF Small World)
  gridWidth: number = 129;
  gridHeight: number = 129;

  tileWidth: number = 16;
  tileHeight: number = 16;

  constructor() {
    super("MainScene");
  }

  create() {
    EventBus.on("change-brush", (brushId: BrushTypeValue) => {
      this.currentBrush = brushId;
      console.log("Brush changed to:", brushId);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.paintTile(pointer);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.paintTile(pointer);
    });
  }

  paintTile(pointer: Phaser.Input.Pointer) {
    const x = Math.floor(pointer.worldX / this.tileWidth) * this.tileWidth;
    const y = Math.floor(pointer.worldY / this.tileHeight) * this.tileHeight;

    const color = TILE_COLORS[this.currentBrush];
    this.add
      .rectangle(x, y, this.tileWidth, this.tileHeight, color)
      .setOrigin(0);
  }
}
