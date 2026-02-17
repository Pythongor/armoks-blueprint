export enum Biome {
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
