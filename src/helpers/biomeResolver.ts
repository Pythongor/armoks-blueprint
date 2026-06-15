import {
  Biome,
  AlignmentTier,
  SavageryTier,
  BiomeDescriptor,
  type WorldPointData,
} from "#types";

export const BiomeColorMap: Record<Biome, number> = {
  [Biome.TemperateOcean]: 0x00008b,
  [Biome.ArcticOcean]: 0x3f008b,
  [Biome.TropicalOcean]: 0x09517a,
  [Biome.Mountain]: 0x4b4b4b,
  [Biome.Glacier]: 0x70ffff,
  [Biome.SandDesert]: 0xffd700,
  [Biome.Badlands]: 0xcd853f,
  [Biome.Tundra]: 0xb0e0e6,
  [Biome.TemperateSwamp]: 0x2f4f4f,
  [Biome.TropicalSwamp]: 0x37653f,
  [Biome.MangroveSwamp]: 0x5f904c,
  [Biome.TemperateMarsh]: 0x808000,
  [Biome.TropicalMarsh]: 0x66cdaa,
  [Biome.Taiga]: 0x4e6e5d,
  [Biome.TemperateConiferousForest]: 0x2d5a27,
  [Biome.TemperateBroadleafForest]: 0x4f7942,
  [Biome.TropicalMoistBroadleafForest]: 0x004d00,
  [Biome.TropicalConiferousForest]: 0x228b22,
  [Biome.Grassland]: 0x32cd32,
  [Biome.TropicalGrassland]: 0x68cd32,
  [Biome.Savanna]: 0xadff2f,
  [Biome.TropicalSavanna]: 0xcbff2f,
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

  if (elevation >= 310) {
    return Biome.Mountain;
  }

  // Oceans
  if (elevation < 100) {
    if (temperature < 0) {
      return Biome.ArcticOcean;
    }

    if (temperature > 70 && rainfall < 65) {
      return Biome.TropicalOcean;
    }

    return Biome.TemperateOcean;
  }

  // Cold biomes
  if (temperature < 0) {
    if (drainage > 70) {
      return Biome.Glacier;
    }

    return Biome.Tundra;
  }

  // Dry biomes
  if (rainfall < 10) {
    if (drainage < 30) {
      return Biome.SandDesert;
    }

    if (drainage < 60) {
      return Biome.RockyWasteland;
    }

    return Biome.Badlands;
  }

  // Scarce rainfall biomes
  if (rainfall < 20) {
    if (temperature > 80) {
      return Biome.TropicalGrassland;
    }

    return Biome.Grassland;
  }

  // Low rainfall biomes
  if (rainfall < 35) {
    if (temperature > 80) {
      return Biome.TropicalSavanna;
    }

    return Biome.Savanna;
  }

  // Medium rainfall biomes
  if (rainfall < 70) {
    if (drainage < 30) {
      if (temperature > 80) {
        return Biome.TropicalMarsh;
      }

      return Biome.TemperateMarsh;
    }

    if (temperature > 80) {
      return Biome.TropicalShrubland;
    }

    return Biome.TemperateShrubland;
  }

  // Swamps
  if (drainage < 30) {
    if (temperature > 80) {
      if (drainage < 10 && rainfall < 85) {
        return Biome.MangroveSwamp;
      }

      return Biome.TropicalSwamp;
    }

    return Biome.TemperateSwamp;
  }

  // Forests

  if (temperature < 10) {
    return Biome.Taiga;
  }

  if (temperature < 15) {
    if (elevation < 230) {
      return Biome.TemperateConiferousForest;
    }

    return Biome.Taiga;
  }

  if (temperature < 65) {
    return Biome.TemperateConiferousForest;
  }

  if (temperature <= 80) {
    if (rainfall < 75) {
      return Biome.TemperateConiferousForest;
    }

    return Biome.TemperateBroadleafForest;
  }

  if (rainfall < 75) {
    return Biome.TropicalConiferousForest;
  }

  if (rainfall < 85) {
    return Biome.TropicalMoistBroadleafForest;
  }

  return Biome.TemperateBroadleafForest;
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
