import Phaser from "phaser";
import { EventBus } from "./EventBus";
import { LayerType } from "@store/brushSlice";
import { type BrushSettings } from "@store/selectors";
import { worldManager } from "@tile-map/WorldManager";
import { getBiomeColor } from "@helpers/biomeResolver";
import { getLayerColor } from "@helpers/paletteResolver";

export class MainScene extends Phaser.Scene {
  private tileSize: number = 16;
  private currentLayer: LayerType = LayerType.Elevation;
  private viewMode: LayerType | "biomes" = "biomes";
  private brushValue: number = 100;
  private brushSize: number = 1;
  private displayGraphics?: Phaser.GameObjects.Graphics;
  private isPanning: boolean = false;

  constructor() {
    super("MainScene");
  }

  create() {
    this.displayGraphics = this.add.graphics();
    const worldWidth = worldManager.gridSize * this.tileSize;
    const worldHeight = worldManager.gridSize * this.tileSize;

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    EventBus.on("brush-updated", (state: BrushSettings) => {
      this.currentLayer = state.activeLayer;
      this.brushValue = state.brushValue;

      if (this.viewMode !== state.viewMode) {
        this.viewMode = state.viewMode;
        this.redrawMap();
      }
    });

    this.setupInputs();
    this.redrawMap();
    this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);
  }

  private setupInputs() {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.middleButtonDown()) this.isPanning = true;
      else this.handleInput(p);
    });

    this.input.on("pointerup", () => (this.isPanning = false));

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.isPanning) {
        this.cameras.main.scrollX -=
          (p.x - p.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -=
          (p.y - p.prevPosition.y) / this.cameras.main.zoom;
      } else if (p.isDown) {
        this.handleInput(p);
      }

      const tx = Math.floor(p.worldX / this.tileSize);
      const ty = Math.floor(p.worldY / this.tileSize);

      if (this.isValidTile(tx, ty)) {
        const index = ty * worldManager.gridSize + tx;
        EventBus.emit("update-coords", { x: tx, y: ty });
        EventBus.emit("update-biome", worldManager.getBiome(index));
      }
    });

    this.input.on(
      "wheel",
      (
        _: Phaser.Input.Pointer,
        __: Phaser.GameObjects.GameObject,
        ___: number,
        deltaY: number,
      ) => {
        const newZoom = this.cameras.main.zoom - deltaY * 0.001;
        this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.2, 3));
      },
    );
  }

  getTileColor(index: number): number {
    const data = worldManager.getPointData(index);

    if (this.viewMode === "biomes") {
      return getBiomeColor(worldManager.getBiome(index), data.volcanism > 90);
    }
    return getLayerColor(
      this.viewMode,
      worldManager.worldData[this.viewMode][index],
    );
  }

  paintTile(tileX: number, tileY: number) {
    if (!this.displayGraphics) return;
    const half = Math.floor(this.brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        if (this.isValidTile(tx, ty)) {
          const index = ty * worldManager.gridSize + tx;

          worldManager.updateTile(index, this.currentLayer, this.brushValue);

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
    const size = worldManager.gridSize;

    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const color = this.getTileColor(i);
      this.displayGraphics.fillStyle(color, 1);
      this.displayGraphics.fillRect(
        x * this.tileSize,
        y * this.tileSize,
        this.tileSize,
        this.tileSize,
      );
    }
  }

  private isValidTile(x: number, y: number) {
    return (
      x >= 0 && x < worldManager.gridSize && y >= 0 && y < worldManager.gridSize
    );
  }

  private handleInput(pointer: Phaser.Input.Pointer) {
    const tileX = Math.floor(pointer.worldX / this.tileSize);
    const tileY = Math.floor(pointer.worldY / this.tileSize);

    if (this.isValidTile(tileX, tileY)) {
      this.paintTile(tileX, tileY);
    }
  }
}
