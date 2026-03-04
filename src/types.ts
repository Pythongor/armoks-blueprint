export enum Biome {
  Ocean = "Ocean",
  Mountain = "Mountain",
  Glacier = "Glacier",
  Tundra = "Tundra",
  HotDesert = "HotDesert",
  Badlands = "Badlands",
  Swamp = "Swamp",
  Marsh = "Marsh",
  Taiga = "Taiga",
  TemperateConiferousForest = "TemperateConiferousForest",
  TemperateBroadleafForest = "TemperateBroadleafForest",
  TropicalMoistBroadleafForest = "TropicalMoistBroadleafForest",
  TropicalDryBroadleafForest = "TropicalDryBroadleafForest",
  TropicalConiferousForest = "TropicalConiferousForest",
  Grassland = "Grassland",
  Savanna = "Savanna",
  TemperateShrubland = "TemperateShrubland",
  TropicalShrubland = "TropicalShrubland",
  RockyWasteland = "RockyWasteland",
}

export enum AlignmentTier {
  Evil = "Evil",
  Neutral = "Neutral",
  Good = "Good",
}

export enum SavageryTier {
  Calm = "Calm",
  Wild = "Wild",
  Untamed = "Untamed",
}

export enum BiomeDescriptor {
  Serene = "Serene",
  Calm = "Calm",
  Sinister = "Sinister",
  Mirthful = "Mirthful",
  Wilderness = "Wilderness",
  Haunted = "Haunted",
  JoyousWilds = "Joyous Wilds",
  UntamedWilds = "Untamed Wilds",
  Terrifying = "Terrifying",
}

export interface WorldPointData {
  elevation: number;
  rainfall: number;
  drainage: number;
  temperature: number;
  volcanism: number;
  savagery: number;
  alignment: number;
}

export type MapData = Record<
  string,
  { x: number; y: number; v: number }[]
> | null;

export type WorldSettings = Record<string, string[][]>;

export interface WorldPreset {
  title: string;
  size: number;
  // Dynamic settings: key is token (e.g., "END_YEAR"),
  // value is array of parameter arrays (e.g., [["250"]])
  settings: WorldSettings;
  mapData?: MapData;
}
