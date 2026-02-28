import Phaser from "phaser";
import { EventBus } from "./EventBus";
import { LayerType, BrushShape } from "@store/brushSlice";
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
  private brushShape: BrushShape = BrushShape.Square;
  private brushOpacity: number = 0.5;
  private touchedTiles: Set<number> = new Set();

  private displayGraphics?: Phaser.GameObjects.Graphics;
  private cursorGraphics?: Phaser.GameObjects.Graphics;

  private isPanning: boolean = false;

  constructor() {
    super("MainScene");
  }

  create() {
    this.displayGraphics = this.add.graphics();
    this.cursorGraphics = this.add.graphics();

    this.updateCameraForCurrentPreset();

    EventBus.on("brush-updated", (state: BrushSettings) => {
      this.currentLayer = state.activeLayer;
      this.brushValue = state.brushValue;
      this.brushSize = state.brushSize;
      this.brushShape = state.brushShape;
      this.brushOpacity = state.brushOpacity;

      if (this.viewMode !== state.viewMode) {
        this.viewMode = state.viewMode;
        this.redrawMap();
      }
    });

    EventBus.on("preset-switched", (presetTitle: string) => {
      worldManager.switchToPreset(presetTitle);

      if (this.cameras && this.cameras.main) {
        this.updateCameraForCurrentPreset();

        this.time.delayedCall(10, () => {
          this.redrawMap();
        });
      } else {
        console.warn("Camera not ready for preset switch yet.");
      }
    });

    EventBus.on("request-redraw", () => {
      this.redrawMap();
    });

    this.setupInputs();
    this.redrawMap();
  }

  private setupInputs() {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.middleButtonDown()) {
        this.isPanning = true;
      } else if (p.leftButtonDown()) {
        this.touchedTiles.clear();
        worldManager.saveSnapshot();
        this.handleInput(p);
      }
    });

    this.input.on("pointerup", () => {
      this.isPanning = false;
      this.touchedTiles.clear();
    });

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

      this.drawCursor(tx, ty);

      if (this.isValidTile(tx, ty)) {
        const index = ty * worldManager.gridSize + tx;
        EventBus.emit("update-coords", { x: tx, y: ty });
        EventBus.emit("update-biome", worldManager.getBiome(index));
        EventBus.emit(
          "update-biome-descriptor",
          worldManager.getBiomeDescriptor(index),
        );
      }
    });

    this.input.on(
      "wheel",
      (
        pointer: Phaser.Input.Pointer,
        __: Phaser.GameObjects.GameObject,
        ___: number,
        deltaY: number,
      ) => {
        const camera = this.cameras.main;
        const oldZoom = camera.zoom;
        const newZoom = Phaser.Math.Clamp(oldZoom - deltaY * 0.001, 0.15, 3);

        if (newZoom !== oldZoom) {
          const worldPointBeforeX =
            (pointer.x - camera.width / 2) / oldZoom + camera.midPoint.x;
          const worldPointBeforeY =
            (pointer.y - camera.height / 2) / oldZoom + camera.midPoint.y;

          camera.removeBounds();
          camera.setZoom(newZoom);

          const newScrollX =
            worldPointBeforeX - (pointer.x - camera.width / 2) / newZoom;
          const newScrollY =
            worldPointBeforeY - (pointer.y - camera.height / 2) / newZoom;

          camera.setScroll(
            newScrollX - camera.width / 2,
            newScrollY - camera.height / 2,
          );

          const worldWidth = worldManager.gridSize * this.tileSize;
          const worldHeight = worldManager.gridSize * this.tileSize;

          camera.setBounds(-500, -500, worldWidth + 1000, worldHeight + 1000);
        }
      },
    );
  }

  private updateCameraForCurrentPreset() {
    const worldWidth = worldManager.gridSize * this.tileSize;
    const worldHeight = worldManager.gridSize * this.tileSize;

    this.cameras.main.removeBounds();
    this.cameras.main.setBounds(
      -500,
      -500,
      worldWidth + 1000,
      worldHeight + 1000,
    );
    this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);

    const padding = 100;
    const zoomX = this.cameras.main.width / (worldWidth + padding);
    const zoomY = this.cameras.main.height / (worldHeight + padding);
    this.cameras.main.setZoom(Math.min(zoomX, zoomY, 1));
  }

  private drawCursor(tx: number, ty: number) {
    if (!this.cursorGraphics) return;

    this.cursorGraphics.clear();
    if (!this.isValidTile(tx, ty)) return;

    const offset = Math.floor(this.brushSize / 2);
    const radius = this.brushSize / 2;

    if (this.brushShape === BrushShape.Square) {
      const x = (tx - offset) * this.tileSize;
      const y = (ty - offset) * this.tileSize;
      const size = this.brushSize * this.tileSize;

      this.cursorGraphics
        .lineStyle(1, 0xffffff, 1)
        .strokeRect(x - 1, y - 1, size + 2, size + 2);
      this.cursorGraphics
        .lineStyle(1, 0x000000, 1)
        .strokeRect(x, y, size, size);
    } else {
      const centerX = tx * this.tileSize + this.tileSize / 2;
      const centerY = ty * this.tileSize + this.tileSize / 2;
      const pixelRadius = radius * this.tileSize;

      this.cursorGraphics
        .lineStyle(1, 0xffffff, 1)
        .strokeCircle(centerX, centerY, pixelRadius + 1);
      this.cursorGraphics
        .lineStyle(1, 0x000000, 1)
        .strokeCircle(centerX, centerY, pixelRadius);
    }
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
    const radiusSq = Math.pow(this.brushSize / 2, 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        if (this.isValidTile(tx, ty)) {
          const index = ty * worldManager.gridSize + tx;

          if (this.touchedTiles.has(index)) continue;

          if (this.brushShape === "circle") {
            const distSq = dx * dx + dy * dy;
            if (distSq > radiusSq) continue;
          }

          this.touchedTiles.add(index);

          const oldData = worldManager.getPointData(index);
          const oldValue = oldData[this.currentLayer as keyof typeof oldData];

          const newValue = Math.round(
            oldValue + (this.brushValue - oldValue) * this.brushOpacity,
          );

          worldManager.updateTile(index, this.currentLayer, newValue);

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
