import {
  Biome,
  AlignmentTier,
  SavageryTier,
  BiomeDescriptor,
  type WorldPointData,
} from "#types";

export const BiomeColorMap: Record<Biome, number> = {
  [Biome.Ocean]: 0x00008b,
  [Biome.Mountain]: 0x4b4b4b,
  [Biome.Glacier]: 0x70ffff,
  [Biome.HotDesert]: 0xffd700,
  [Biome.Badlands]: 0xcd853f,
  [Biome.Tundra]: 0xb0e0e6,
  [Biome.Swamp]: 0x2f4f4f,
  [Biome.Marsh]: 0x4682b4,
  [Biome.Taiga]: 0x4e6e5d,
  [Biome.TemperateConiferousForest]: 0x2d5a27,
  [Biome.TemperateBroadleafForest]: 0x4f7942,
  [Biome.TropicalMoistBroadleafForest]: 0x004d00,
  [Biome.TropicalDryBroadleafForest]: 0x556b2f,
  [Biome.TropicalConiferousForest]: 0x228b22,
  [Biome.Grassland]: 0x32cd32,
  [Biome.Savanna]: 0xadff2f,
  [Biome.TemperateShrubland]: 0x8ba870,
  [Biome.TropicalShrubland]: 0xa3ad62,
  [Biome.RockyWasteland]: 0xa9a9a9,
};

export const lavaColor = 0xff4500;

export const biomeMoralityMatrix: Record<
  SavageryTier,
  Record<AlignmentTier, BiomeDescriptor>
> = {
  [SavageryTier.Calm]: {
    [AlignmentTier.Good]: BiomeDescriptor.Serene,
    [AlignmentTier.Neutral]: BiomeDescriptor.Calm,
    [AlignmentTier.Evil]: BiomeDescriptor.Sinister,
  },
  [SavageryTier.Wild]: {
    [AlignmentTier.Good]: BiomeDescriptor.Mirthful,
    [AlignmentTier.Neutral]: BiomeDescriptor.Wilderness,
    [AlignmentTier.Evil]: BiomeDescriptor.Haunted,
  },
  [SavageryTier.Untamed]: {
    [AlignmentTier.Good]: BiomeDescriptor.JoyousWilds,
    [AlignmentTier.Neutral]: BiomeDescriptor.UntamedWilds,
    [AlignmentTier.Evil]: BiomeDescriptor.Terrifying,
  },
};

export function identifyBiome(data: WorldPointData): Biome {
  const { elevation, rainfall, temperature, drainage } = data;

  if (elevation < 100) return Biome.Ocean;
  if (elevation > 300) return Biome.Mountain;

  if (temperature < -20) {
    if (rainfall > 40) return Biome.Glacier;
    return Biome.Tundra;
  }

  if (temperature < 0) {
    if (rainfall > 35 && drainage > 33) return Biome.Taiga;
    return Biome.Tundra;
  }

  if (drainage > 95 && elevation > 150) return Biome.RockyWasteland;

  if (rainfall < 20) {
    return temperature > 85 ? Biome.HotDesert : Biome.Badlands;
  }

  if (temperature > 80) {
    if (rainfall > 66 && drainage < 33) return Biome.Swamp;
    if (rainfall > 80) return Biome.TropicalMoistBroadleafForest;
    if (rainfall > 50) {
      return drainage > 66
        ? Biome.TropicalConiferousForest
        : Biome.TropicalDryBroadleafForest;
    }
    return Biome.Savanna;
  }

  if (rainfall > 66) {
    if (drainage < 33) return Biome.Marsh;

    return temperature > 25
      ? Biome.TemperateBroadleafForest
      : Biome.TemperateConiferousForest;
  }

  if (rainfall < 45) {
    if (drainage > 75) {
      return temperature > 80
        ? Biome.TropicalShrubland
        : Biome.TemperateShrubland;
    }

    return temperature > 55 ? Biome.Savanna : Biome.Grassland;
  }

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

export function getMoralTiers(savagery: number, alignment: number) {
  const savageryTier =
    savagery > 66
      ? SavageryTier.Untamed
      : savagery > 33
        ? SavageryTier.Wild
        : SavageryTier.Calm;
  const alignmentTier =
    alignment > 66
      ? AlignmentTier.Good
      : alignment > 33
        ? AlignmentTier.Neutral
        : AlignmentTier.Evil;
  return { savageryTier, alignmentTier };
}

export function getMoralDescriptor(savagery: number, alignment: number) {
  const { savageryTier, alignmentTier } = getMoralTiers(savagery, alignment);

  return biomeMoralityMatrix[savageryTier][alignmentTier];
}

export function formatBiomeText(biome: string) {
  return biome.replace(/([A-Z])/g, " $1").trim();
}

export function formatBiomeDescriptor(descriptor: string) {
  return descriptor.replace(/\s+/g, "_");
}
