import { Biome } from "@/types";

export interface WorldPointData {
  elevation: number;
  rainfall: number;
  drainage: number;
  temperature: number;
  volcanism: number;
}

export const BiomeColorMap: Record<Biome, number> = {
  [Biome.Ocean]: 0x00008b,
  [Biome.Mountain]: 0x4b4b4b,
  [Biome.Glacier]: 0x70ffff,
  [Biome.HotDesert]: 0xffd700,
  [Biome.Badlands]: 0xcd853f,
  [Biome.Tundra]: 0xb0e0e6,
  [Biome.Swamp]: 0x2f4f4f,
  [Biome.Marsh]: 0x4682b4,
  [Biome.Jungle]: 0x006400,
  [Biome.Forest]: 0x228b22,
  [Biome.Grassland]: 0x32cd32,
  [Biome.Savanna]: 0xadff2f,
};

export const lavaColor = 0xff4500;

export function identifyBiome(data: WorldPointData): Biome {
  const { elevation, rainfall, temperature, drainage } = data;

  if (elevation < 100) return Biome.Ocean;
  if (elevation > 300) return Biome.Mountain;

  if (temperature < 10) return Biome.Glacier;
  if (temperature < 25) return Biome.Tundra;

  if (rainfall < 20) {
    return temperature > 60 ? Biome.HotDesert : Biome.Badlands;
  }

  if (rainfall > 66) {
    if (drainage < 33) {
      return temperature > 45 ? Biome.Swamp : Biome.Marsh;
    }
    return temperature > 65 ? Biome.Jungle : Biome.Forest;
  }

  if (rainfall < 40) return Biome.Savanna;
  if (drainage > 50) return Biome.Forest;

  return Biome.Grassland;
}

export function getBiomeColor(
  type: Biome,
  isVolcanic: boolean = false,
): number {
  const baseColor = BiomeColorMap[type];

  if (!isVolcanic) {
    return baseColor;
  }

  return Phaser.Display.Color.Interpolate.ColorWithColor(
    Phaser.Display.Color.IntegerToColor(baseColor),
    Phaser.Display.Color.IntegerToColor(lavaColor),
    100,
    30,
  ).color;
}
