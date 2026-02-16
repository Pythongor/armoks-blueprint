import Phaser from "phaser";
import { EventBus } from "./EventBus";
import { LayerType } from "@store/brushSlice";
import { type BrushSettings } from "@store/selectors";

const BiomeColors = {
  Ocean: 0x00008b,
  Mountain: 0x808080,
  Tundra: 0xffffff,
  Grassland: 0x32cd32,
  Desert: 0xedc9af,
  Swamp: 0x228b22,
  Jungle: 0x006400,
} as const;

export class MainScene extends Phaser.Scene {
  private gridSize: number = 129;
  private tileSize: number = 16;

  private currentLayer: LayerType = LayerType.Elevation;
  private viewMode: LayerType | "biomes" = "biomes";
  private brushValue: number = 100;
  private brushSize: number = 1;

  private worldData: Record<LayerType, Uint16Array> = {
    elevation: new Uint16Array(this.gridSize * this.gridSize).fill(100),
    rainfall: new Uint16Array(this.gridSize * this.gridSize).fill(50),
    drainage: new Uint16Array(this.gridSize * this.gridSize).fill(50),
    temperature: new Uint16Array(this.gridSize * this.gridSize).fill(50),
    volcanism: new Uint16Array(this.gridSize * this.gridSize).fill(0),
  };

  private displayGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super("MainScene");
  }

  create() {
    this.displayGraphics = this.add.graphics();

    EventBus.on("brush-updated", (state: BrushSettings) => {
      this.currentLayer = state.activeLayer;
      this.brushValue = state.brushValue;

      if (this.viewMode !== state.viewMode) {
        this.viewMode = state.viewMode;
        this.redrawMap();
      }
    });

    this.redrawMap();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.handleInput(pointer);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.handleInput(pointer);
      }

      const tileX = Math.floor(pointer.worldX / this.tileSize);
      const tileY = Math.floor(pointer.worldY / this.tileSize);
      EventBus.emit("update-coords", { x: tileX, y: tileY });
    });
  }

  getTileColor(index: number): number {
    if (this.viewMode !== "biomes") {
      const val = this.worldData[this.viewMode][index];
      const max = this.viewMode === LayerType.Elevation ? 400 : 100;
      const brightness = Math.floor((val / max) * 255);
      return Phaser.Display.Color.GetColor(brightness, brightness, brightness);
    }

    const elevation = this.worldData.elevation[index];
    const rainfall = this.worldData.rainfall[index];
    const temperature = this.worldData.temperature[index];
    const drainage = this.worldData.drainage[index];

    if (elevation < 100) return BiomeColors.Ocean;

    if (elevation > 300) return BiomeColors.Mountain;

    if (temperature < 20) return BiomeColors.Tundra;
    if (rainfall > 75) {
      return drainage < 30 ? BiomeColors.Swamp : BiomeColors.Jungle;
    }
    if (rainfall < 20) return BiomeColors.Desert;

    return BiomeColors.Grassland;
  }

  paintTile(tileX: number, tileY: number) {
    if (!this.displayGraphics) return;

    const halfSize = Math.floor(this.brushSize / 2);

    for (let dy = -halfSize; dy <= halfSize; dy++) {
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        if (tx >= 0 && tx < this.gridSize && ty >= 0 && ty < this.gridSize) {
          const index = ty * this.gridSize + tx;

          this.worldData[this.currentLayer][index] = this.brushValue;

          const color = this.getTileColor(index);
          this.displayGraphics.fillStyle(color, 1);
          this.displayGraphics.fillRect(
            tx * this.tileSize,
            ty * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
        }
      }
    }
  }

  redrawMap() {
    if (!this.displayGraphics) return;

    this.displayGraphics.clear();
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const index = y * this.gridSize + x;
        const color = this.getTileColor(index);
        this.displayGraphics.fillStyle(color, 1);
        this.displayGraphics.fillRect(x * 16, y * 16, 16, 16);
      }
    }
  }

  private handleInput(pointer: Phaser.Input.Pointer) {
    const tileX = Math.floor(pointer.worldX / this.tileSize);
    const tileY = Math.floor(pointer.worldY / this.tileSize);

    if (
      tileX >= 0 &&
      tileX < this.gridSize &&
      tileY >= 0 &&
      tileY < this.gridSize
    ) {
      this.paintTile(tileX, tileY);
    }
  }
}
