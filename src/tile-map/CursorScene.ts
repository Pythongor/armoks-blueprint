import Phaser from "phaser";
import { BusEvent, EventBus } from "./EventBus";
import { BrushShape, PaintMode } from "@store/paintSlice";
import { type PaintSettings } from "@store/selectors";
import type { GridScene } from "./GridScene";

export class CursorScene extends Phaser.Scene {
  private tileSize: number = 16;
  private brushWidth: number = 1;
  private brushShape: BrushShape = BrushShape.Square;
  private paintMode: PaintMode = PaintMode.Brush;
  private cursorGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super("CursorScene");
  }

  create() {
    this.cursorGraphics = this.add.graphics();

    EventBus.on(BusEvent.BrushUpdated, (state: PaintSettings) => {
      this.brushWidth = state.brushWidth;
      this.brushShape = state.brushShape;
      this.paintMode = state.paintMode;
    });

    EventBus.on(
      BusEvent.CursorMoved,
      ({ tx, ty, isValid }: { tx: number; ty: number; isValid: boolean }) => {
        this.handleCursorUpdate(tx, ty, isValid);
      },
    );
  }

  private handleCursorUpdate(tx: number, ty: number, isValid: boolean) {
    if (!this.cursorGraphics) return;

    this.cursorGraphics.clear();

    if (!isValid || this.paintMode === PaintMode.Line) return;

    const gridScene = this.scene.get("GridScene") as GridScene;
    if (gridScene && gridScene.cameras.main) {
      const mainCamera = gridScene.cameras.main;
      this.cameras.main.scrollX = mainCamera.scrollX;
      this.cameras.main.scrollY = mainCamera.scrollY;
      this.cameras.main.zoom = mainCamera.zoom;
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

      this.cursorGraphics!.lineStyle(1, 0xffffff, 1).strokeRect(
        x - 1,
        y - 1,
        size + 2,
        size + 2,
      );

      this.cursorGraphics!.lineStyle(1, 0x000000, 1).strokeRect(
        x,
        y,
        size,
        size,
      );
    } else {
      const centerX = tx * this.tileSize + this.tileSize / 2;
      const centerY = ty * this.tileSize + this.tileSize / 2;
      const pixelRadius = radius * this.tileSize;

      this.cursorGraphics!.lineStyle(1, 0xffffff, 1).strokeCircle(
        centerX,
        centerY,
        pixelRadius + 1,
      );

      this.cursorGraphics!.lineStyle(1, 0x000000, 1).strokeCircle(
        centerX,
        centerY,
        pixelRadius,
      );
    }
  }
}
