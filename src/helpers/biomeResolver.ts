export enum BiomeType {
  Ocean = "Ocean",
  Mountain = "Mountain",
  Glacier = "Glacier",
  Tundra = "Tundra",
  HotDesert = "HotDesert",
  Badlands = "Badlands",
  Swamp = "Swamp",
  Marsh = "Marsh",
  Jungle = "Jungle",
  Forest = "Forest",
  Grassland = "Grassland",
  Savanna = "Savanna",
}

export interface WorldPointData {
  elevation: number;
  rainfall: number;
  drainage: number;
  temperature: number;
  volcanism: number;
}

export const BiomeColorMap: Record<BiomeType, number> = {
  [BiomeType.Ocean]: 0x00008b,
  [BiomeType.Mountain]: 0x4b4b4b,
  [BiomeType.Glacier]: 0x70ffff,
  [BiomeType.HotDesert]: 0xffd700,
  [BiomeType.Badlands]: 0xcd853f,
  [BiomeType.Tundra]: 0xb0e0e6,
  [BiomeType.Swamp]: 0x2f4f4f,
  [BiomeType.Marsh]: 0x4682b4,
  [BiomeType.Jungle]: 0x006400,
  [BiomeType.Forest]: 0x228b22,
  [BiomeType.Grassland]: 0x32cd32,
  [BiomeType.Savanna]: 0xadff2f,
};

export const lavaColor = 0xff4500;

export function identifyBiome(data: WorldPointData): BiomeType {
  const { elevation, rainfall, temperature, drainage } = data;

  if (elevation < 100) return BiomeType.Ocean;
  if (elevation > 300) return BiomeType.Mountain;

  if (temperature < 10) return BiomeType.Glacier;
  if (temperature < 25) return BiomeType.Tundra;

  if (rainfall < 20) {
    return temperature > 60 ? BiomeType.HotDesert : BiomeType.Badlands;
  }

  if (rainfall > 66) {
    if (drainage < 33) {
      return temperature > 45 ? BiomeType.Swamp : BiomeType.Marsh;
    }
    return temperature > 65 ? BiomeType.Jungle : BiomeType.Forest;
  }

  if (rainfall < 40) return BiomeType.Savanna;
  if (drainage > 50) return BiomeType.Forest;

  return BiomeType.Grassland;
}

export function getBiomeColor(
  type: BiomeType,
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
