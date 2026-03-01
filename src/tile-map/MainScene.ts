import type { BrushScene } from "./BrushScene";
import { EventBus } from "./EventBus";
import type { GridScene } from "./GridScene";
import { PaintMode } from "@store/paintSlice";
import type { PaintSettings } from "@store/selectors";
import Phaser from "phaser";
import { worldManager } from "./WorldManager";

export class MainScene extends Phaser.Scene {
  private isPanning: boolean = false;
  private paintMode: PaintMode = PaintMode.Brush;

  constructor() {
    super("MainScene");
  }

  create() {
    this.scene.launch("GridScene");
    this.scene.launch("BrushScene");
    this.scene.launch("LineScene");

    EventBus.on("brush-updated", (state: PaintSettings) => {
      this.paintMode = state.paintMode;
    });

    this.setupGlobalInputs();
  }

  private setupGlobalInputs() {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.middleButtonDown()) {
        this.isPanning = true;
        return;
      }

      const coords = this.getTileCoords(p);
      if (!coords.isValid) return;

      if (this.paintMode === PaintMode.Line) {
        EventBus.emit("line-start", { x: coords.tx, y: coords.ty });
      } else {
        worldManager.saveSnapshot();
        this.processPaintInput(p);
      }
    });

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      const coords = this.getTileCoords(p);

      EventBus.emit("cursor-moved", {
        tx: coords.tx,
        ty: coords.ty,
        isValid: coords.isValid,
      });

      if (this.isPanning) {
        const cam = (this.scene.get("GridScene") as GridScene).cameras.main;
        cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
        cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
      } else if (p.isDown && this.paintMode === PaintMode.Brush) {
        this.processPaintInput(p);
      }

      if (coords.isValid) {
        const index = coords.ty * worldManager.gridSize + coords.tx;
        EventBus.emit("update-coords", { x: coords.tx, y: coords.ty });
        EventBus.emit("update-biome", worldManager.getBiome(index));
      }
    });

    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (this.paintMode === PaintMode.Line && !this.isPanning) {
        const coords = this.getTileCoords(p);

        if (coords.isValid) {
          worldManager.saveSnapshot();
          EventBus.emit("line-end", { x: coords.tx, y: coords.ty });
        }
      }

      this.isPanning = false;
      EventBus.emit("stroke-finished");
    });

    this.input.on(
      "wheel",
      (
        pointer: Phaser.Input.Pointer,
        _: unknown,
        __: unknown,
        deltaY: number,
      ) => {
        const gridScene = this.scene.get("GridScene") as GridScene;
        gridScene.handleZoom(pointer, deltaY);
      },
    );
  }

  private getTileCoords(p: Phaser.Input.Pointer) {
    const gridScene = this.scene.get("GridScene") as GridScene;
    const worldPoint = gridScene.cameras.main.getWorldPoint(p.x, p.y);
    const tx = Math.floor(worldPoint.x / gridScene.tileSize);
    const ty = Math.floor(worldPoint.y / gridScene.tileSize);

    return { tx, ty, isValid: gridScene.isValidTile(tx, ty) };
  }

  private processPaintInput(p: Phaser.Input.Pointer) {
    const brushScene = this.scene.get("BrushScene") as BrushScene;
    const coords = this.getTileCoords(p);

    if (coords.isValid) {
      brushScene.handlePaintAction(coords.tx, coords.ty);
    }
  }
}
