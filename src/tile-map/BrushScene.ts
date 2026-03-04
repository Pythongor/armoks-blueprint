import { BusEvent, EventBus } from "./EventBus";

import { BrushShape } from "@store/paintSlice";
import type { GridScene } from "./GridScene";
import Phaser from "phaser";

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

    const onCursorMove = (data: {
      tx: number;
      ty: number;
      isValid: boolean;
    }) => {
      this.updateBrushVisuals(data.tx, data.ty, data.isValid);
    };

    EventBus.on(BusEvent.CursorMoved, onCursorMove);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(BusEvent.CursorMoved, onCursorMove);
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      EventBus.off(BusEvent.CursorMoved, onCursorMove);
    });
  }

  private updateBrushVisuals(tx: number, ty: number, isValid: boolean) {
    if (!this.scene || !this.game || !this.sys.isActive()) {
      return;
    }

    if (!this.brushGraphics) return;

    this.brushGraphics.clear();

    if (!isValid || !this.isActive) return;

    const gridScene = this.game.scene.getScene("GridScene") as GridScene;

    if (gridScene && gridScene.sys && gridScene.sys.cameras) {
      const mainCam = gridScene.cameras.main;
      const thisCam = this.cameras.main;

      if (mainCam && thisCam) {
        thisCam.scrollX = mainCam.scrollX;
        thisCam.scrollY = mainCam.scrollY;
        thisCam.zoom = mainCam.zoom;
      }
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
