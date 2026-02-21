import { LayerType } from "@store/brushSlice";
import { normalize } from "@helpers/common";
import { worldManager } from "@tile-map/WorldManager";

export class ImageExporter {
  private static getNormalizedValue(value: number, layer: LayerType): number {
    const max = layer === LayerType.Elevation ? 400 : 100;
    return Math.floor(normalize(value, max, 255));
  }

  static createCanvas(size: number) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return { canvas, context: canvas.getContext("2d") };
  }

  static setPixel(
    imageData: ImageData,
    worldData: Uint16Array<ArrayBufferLike>,
    index: number,
    layer: LayerType,
  ) {
    const normalized = this.getNormalizedValue(worldData[index], layer);
    const pixelIndex = index * 4;

    imageData.data[pixelIndex] = normalized; // R
    imageData.data[pixelIndex + 1] = normalized; // G
    imageData.data[pixelIndex + 2] = normalized; // B
    imageData.data[pixelIndex + 3] = 255; // A
  }

  static async exportElevationForPerfectWorld(): Promise<void> {
    const sourceSize = worldManager.gridSize;
    const targetSize = 257;
    const layer = LayerType.Elevation;

    const { context, canvas: sourceCanvas } = this.createCanvas(sourceSize);
    if (!context) return;

    const imageData = context.createImageData(sourceSize, sourceSize);
    const data = worldManager.worldData[layer];

    for (let i = 0; i < data.length; i++) {
      this.setPixel(imageData, data, i, layer);
    }

    context.putImageData(imageData, 0, 0);

    const { context: targetCtx, canvas: targetCanvas } =
      this.createCanvas(targetSize);
    if (!targetCtx) return;

    targetCtx.imageSmoothingEnabled = false;

    targetCtx.drawImage(
      sourceCanvas,
      0,
      0,
      sourceSize,
      sourceSize,
      0,
      0,
      targetSize,
      targetSize,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      targetCanvas.toBlob(resolve, "image/png"),
    );

    if (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `elevation_map_${targetSize}.png`;
      link.click();

      URL.revokeObjectURL(link.href);
    }
  }
}
