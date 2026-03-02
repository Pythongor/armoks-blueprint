import { getBiomeColor, identifyBiome } from "@helpers/biomeResolver";
import { useEffect, useRef } from "react";
import { type MapData } from "@/types";

import styles from "./Thumbnail.module.scss";

const drawThumbnail = (
  ctx: CanvasRenderingContext2D,
  mapData: MapData,
  size: number = 256,
) => {
  if (!mapData) {
    ctx.fillStyle = "#32cd32";
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const imageData = ctx.createImageData(size, size);

  for (let i = 0; i < mapData.elevation.length; i++) {
    const point = {
      elevation: mapData.elevation[i]?.v ?? 0,
      drainage: mapData.drainage[i]?.v ?? 50,
      temperature: mapData.temperature[i]?.v ?? 50,
      rainfall: mapData.rainfall[i]?.v ?? 50,
      volcanism: mapData.volcanism[i]?.v ?? 0,
      savagery: mapData.savagery[i]?.v ?? 0,
      alignment: mapData.alignment[i]?.v ?? 50,
    };

    const biome = identifyBiome(point);
    const colorInt = getBiomeColor(biome, false);

    const r = (colorInt >> 16) & 0xff;
    const g = (colorInt >> 8) & 0xff;
    const b = colorInt & 0xff;

    const rIdx = i * 4;
    imageData.data[rIdx] = r;
    imageData.data[rIdx + 1] = g;
    imageData.data[rIdx + 2] = b;
    imageData.data[rIdx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
};

export const Thumbnail = ({ data, size }: { data: MapData; size: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawThumbnail(ctx, data, size);
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={styles.base}
    />
  );
};
