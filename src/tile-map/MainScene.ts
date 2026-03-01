import { EventBus } from "./EventBus";
import type { GridScene } from "./GridScene";
import Phaser from "phaser";
import { worldManager } from "./WorldManager";

export class MainScene extends Phaser.Scene {
  private isPanning: boolean = false;

  constructor() {
    super("MainScene");
  }

  create() {
    this.scene.launch("GridScene");
    this.scene.launch("CursorScene");

    this.setupGlobalInputs();
  }

  private setupGlobalInputs() {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.middleButtonDown()) {
        this.isPanning = true;
      } else if (p.leftButtonDown()) {
        worldManager.saveSnapshot();
        this.processPaintInput(p);
      }
    });

    this.input.on("pointerup", () => {
      this.isPanning = false;
      EventBus.emit("stroke-finished");
    });

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      const gridScene = this.scene.get("GridScene") as GridScene;
      if (!gridScene || !gridScene.cameras.main) return;

      const cam = gridScene.cameras.main;
      const worldPoint = cam.getWorldPoint(p.x, p.y);

      const tx = Math.floor(worldPoint.x / gridScene.tileSize);
      const ty = Math.floor(worldPoint.y / gridScene.tileSize);
      const isValid = gridScene.isValidTile(tx, ty);

      EventBus.emit("cursor-moved", { tx, ty, isValid });

      if (this.isPanning) {
        cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
        cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
      } else if (p.isDown) {
        this.processPaintInput(p);
      }

      if (isValid) {
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
        _: unknown,
        __: unknown,
        deltaY: number,
      ) => {
        const gridScene = this.scene.get("GridScene") as GridScene;
        if (gridScene) gridScene.handleZoom(pointer, deltaY);
      },
    );
  }

  private processPaintInput(pointer: Phaser.Input.Pointer) {
    const gridScene = this.scene.get("GridScene") as GridScene;
    const worldPoint = gridScene.cameras.main.getWorldPoint(
      pointer.x,
      pointer.y,
    );
    const tx = Math.floor(worldPoint.x / gridScene.tileSize);
    const ty = Math.floor(worldPoint.y / gridScene.tileSize);

    if (gridScene.isValidTile(tx, ty)) {
      gridScene.paintTile(tx, ty);
    }
  }
}
