import Phaser from "phaser";
import { EventBus } from "./EventBus";
import { LayerType } from "@store/brushSlice";
import { type BrushSettings } from "@store/selectors";
import { identifyBiome, getBiomeColor } from "@/helpers/biomeResolver";
import { getLayerColor } from "@/helpers/paletteResolver";

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
    savagery: new Uint16Array(this.gridSize * this.gridSize).fill(0),
  };

  private displayGraphics?: Phaser.GameObjects.Graphics;

  private isPanning: boolean = false;

  constructor() {
    super("MainScene");
  }

  create() {
    this.displayGraphics = this.add.graphics();

    const worldWidth = this.gridSize * this.tileSize;
    const worldHeight = this.gridSize * this.tileSize;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

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
      if (pointer.middleButtonDown()) {
        this.isPanning = true;
      } else {
        this.handleInput(pointer);
      }
    });

    this.input.on("pointerup", () => {
      this.isPanning = false;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isPanning) {
        this.cameras.main.scrollX -=
          (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -=
          (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
      } else if (pointer.isDown) {
        this.handleInput(pointer);
      }

      const tileX = Math.floor(pointer.worldX / this.tileSize);
      const tileY = Math.floor(pointer.worldY / this.tileSize);

      EventBus.emit("update-coords", {
        x: tileX,
        y: tileY,
      });

      if (
        tileX >= 0 &&
        tileX < this.gridSize &&
        tileY >= 0 &&
        tileY < this.gridSize
      ) {
        const index = tileY * this.gridSize + tileX;

        const pointData = this.getPointData(index);

        const biome = identifyBiome(pointData);

        EventBus.emit("update-biome", biome);
      }
    });

    this.input.on(
      "wheel",
      (
        _: Phaser.Input.Pointer,
        __: Phaser.GameObjects.GameObject[],
        ___: number,
        deltaY: number,
      ) => {
        const zoomSpeed = 0.001;
        const newZoom = this.cameras.main.zoom - deltaY * zoomSpeed;
        this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.2, 3));
      },
    );

    this.redrawMap();
    this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);
  }

  getPointData(index: number) {
    return {
      elevation: this.worldData.elevation[index],
      rainfall: this.worldData.rainfall[index],
      drainage: this.worldData.drainage[index],
      temperature: this.worldData.temperature[index],
      volcanism: this.worldData.volcanism[index],
    };
  }

  getTileColor(index: number): number {
    const pointData = this.getPointData(index);

    if (this.viewMode === "biomes") {
      const biomeType = identifyBiome(pointData);
      const isVolcanic = pointData.volcanism > 90;

      return getBiomeColor(biomeType, isVolcanic);
    }

    return getLayerColor(this.viewMode, this.worldData[this.viewMode][index]);
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
