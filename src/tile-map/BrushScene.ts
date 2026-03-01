import Phaser from "phaser";
import { BusEvent, EventBus } from "./EventBus";
import { BrushShape, PaintMode } from "@store/paintSlice";
import { type PaintSettings } from "@store/selectors";
import type { GridScene } from "./GridScene";

export class BrushScene extends Phaser.Scene {
  private tileSize: number = 16;
  private brushWidth: number = 1;
  private brushShape: BrushShape = BrushShape.Square;
  private brushGraphics?: Phaser.GameObjects.Graphics;
  private isActive: boolean = true;

  constructor() {
    super("BrushScene");
  }

  create() {
    this.brushGraphics = this.add.graphics();

    EventBus.on(BusEvent.BrushUpdated, (state: PaintSettings) => {
      this.brushWidth = state.brushWidth;
      this.brushShape = state.brushShape;
      this.isActive = state.paintMode === PaintMode.Brush;
    });

    EventBus.on(
      BusEvent.CursorMoved,
      ({ tx, ty, isValid }: { tx: number; ty: number; isValid: boolean }) => {
        this.updateBrushVisuals(tx, ty, isValid);
      },
    );
  }

  private updateBrushVisuals(tx: number, ty: number, isValid: boolean) {
    if (!this.brushGraphics) return;

    this.brushGraphics.clear();

    if (!isValid || !this.isActive) return;

    const gridScene = this.scene.get("GridScene") as GridScene;
    if (gridScene && gridScene.cameras.main) {
      const mainCam = gridScene.cameras.main;
      this.cameras.main.scrollX = mainCam.scrollX;
      this.cameras.main.scrollY = mainCam.scrollY;
      this.cameras.main.zoom = mainCam.zoom;
    }

    this.drawCursor(tx, ty);
  }

  private drawCursor(tx: number, ty: number) {
    const offset = Math.floor(this.brushWidth / 2);
    const radius = this.brushWidth / 2;

    if (this.brushShape === BrushShape.Square) {
      const x = (tx - offset) * this.tileSize;
      const y = (ty - offset) * this.tileSize;
      const size = this.brushWidth * this.tileSize;

      this.brushGraphics!.lineStyle(1, 0xffffff, 1).strokeRect(
        x - 1,
        y - 1,
        size + 2,
        size + 2,
      );

      this.brushGraphics!.lineStyle(1, 0x000000, 1).strokeRect(
        x,
        y,
        size,
        size,
      );
    } else {
      const centerX = tx * this.tileSize + this.tileSize / 2;
      const centerY = ty * this.tileSize + this.tileSize / 2;
      const pixelRadius = radius * this.tileSize;

      this.brushGraphics!.lineStyle(1, 0xffffff, 1).strokeCircle(
        centerX,
        centerY,
        pixelRadius + 1,
      );

      this.brushGraphics!.lineStyle(1, 0x000000, 1).strokeCircle(
        centerX,
        centerY,
        pixelRadius,
      );
    }
  }

  public handlePaintAction(tx: number, ty: number) {
    const gridScene = this.scene.get("GridScene") as GridScene;
    if (!gridScene) return;

    gridScene.paintTile(tx, ty);
  }
}
