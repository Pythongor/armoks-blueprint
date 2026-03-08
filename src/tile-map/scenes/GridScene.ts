import Phaser from "phaser";
import { BusEvent, EventBus } from "../EventBus";
import { LayerType, BrushShape } from "@store/paintSlice";
import { type PaintSettings } from "@store/selectors";
import { worldManager } from "@tile-map/WorldManager";
import { getBiomeColor } from "@helpers/biomeResolver";
import { getLayerColor } from "@helpers/paletteResolver";

export class GridScene extends Phaser.Scene {
  public tileSize: number = 16;
  private currentLayer: LayerType = LayerType.Elevation;
  private viewMode: LayerType | "biomes" = "biomes";
  private brushValue: number = 100;
  private brushWidth: number = 1;
  private brushShape: BrushShape = BrushShape.Square;
  private brushOpacity: number = 1.0;
  private touchedTiles: Set<number> = new Set();

  private displayGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super("GridScene");
  }

  create() {
    this.displayGraphics = this.add.graphics();
    this.updateCameraForCurrentPreset();

    EventBus.on(BusEvent.PresetSwitched, () => {
      this.updateCameraForCurrentPreset();

      this.touchedTiles.clear();

      this.redrawMap();
    });

    EventBus.on(BusEvent.BrushUpdated, (state: PaintSettings) => {
      this.currentLayer = state.activeLayer;
      this.brushValue = state.brushValue;
      this.brushWidth = state.brushWidth;
      this.brushShape = state.brushShape;
      this.brushOpacity = state.opacity;

      if (this.viewMode !== state.viewMode) {
        this.viewMode = state.viewMode;
        this.redrawMap();
      }
    });

    EventBus.on(BusEvent.StrokeFinished, () => this.touchedTiles.clear());
    EventBus.on(BusEvent.RequestRedraw, () => this.redrawMap());

    this.redrawMap();
  }

  public handleZoom(pointer: Phaser.Input.Pointer, deltaY: number) {
    const camera = this.cameras.main;
    const oldZoom = camera.zoom;
    const newZoom = Phaser.Math.Clamp(oldZoom - deltaY * 0.001, 0.15, 3);

    if (newZoom !== oldZoom) {
      const worldPointBefore = camera.getWorldPoint(pointer.x, pointer.y);
      camera.setZoom(newZoom);
      const worldPointAfter = camera.getWorldPoint(pointer.x, pointer.y);

      camera.scrollX += worldPointBefore.x - worldPointAfter.x;
      camera.scrollY += worldPointBefore.y - worldPointAfter.y;
    }
  }

  public paintTile(tileX: number, tileY: number) {
    if (!this.displayGraphics) return;

    const half = Math.floor(this.brushWidth / 2);
    const radiusSq = Math.pow(this.brushWidth / 2, 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        if (this.isValidTile(tx, ty)) {
          const index = ty * worldManager.gridSize + tx;

          if (this.touchedTiles.has(index)) continue;

          if (this.brushShape === BrushShape.Circle) {
            if (dx * dx + dy * dy > radiusSq) continue;
          }

          this.touchedTiles.add(index);

          const oldVal = worldManager.worldData[this.currentLayer][index];
          const newVal = Math.round(
            oldVal + (this.brushValue - oldVal) * this.brushOpacity,
          );

          worldManager.updateTile(index, this.currentLayer, newVal);

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

  public redrawMap() {
    if (!this.displayGraphics) return;

    this.displayGraphics.clear();
    const size = worldManager.gridSize;

    if (size <= 0) return;

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

  private getTileColor(index: number): number {
    const data = worldManager.getPointData(index);

    if (this.viewMode === "biomes") {
      return getBiomeColor(worldManager.getBiome(index), data.volcanism > 90);
    }

    return getLayerColor(
      this.viewMode,
      worldManager.worldData[this.viewMode][index],
    );
  }

  public isValidTile(x: number, y: number) {
    return (
      x >= 0 && x < worldManager.gridSize && y >= 0 && y < worldManager.gridSize
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

    const idealZoom = Math.min(zoomX, zoomY, 1);
    this.cameras.main.setZoom(idealZoom);
  }
}
