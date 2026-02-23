export interface WorldPreset {
  title: string;
  size: number;
  // Dynamic settings: key is token (e.g., "END_YEAR"),
  // value is array of parameter arrays (e.g., [["250"]])
  settings: Record<string, string[][]>;
  // Map data is usually empty in standard world_gen.txt but handled for custom exports
  mapData?: Record<string, { x: number; y: number; v: number }[]>;
}

const tokenRegex = /\[([^\]]+)\]/g;

export class WorldGenToUniversalJson {
  /**
   * Parses the entire world_gen.txt content into an array of presets.
   */
  static parse(input: string): WorldPreset[] {
    // 1. Split the file into individual [WORLD_GEN] blocks
    // We split by the tag, and filter out any empty strings resulting from the split
    const blocks = input
      .split(/\[WORLD_GEN\]/)
      .filter((b) => b.trim().length > 0);

    return blocks.map((block) => this.parseSingleBlock(block));
  }

  private static parseSingleBlock(blockContent: string): WorldPreset {
    const preset: WorldPreset = {
      title: "Untitled Blueprint",
      size: 129,
      settings: {},
      mapData: {},
    };

    let match;
    tokenRegex.lastIndex = 0;

    while ((match = tokenRegex.exec(blockContent)) !== null) {
      const parts = match[1].split(":");
      const key = parts[0];
      const params = parts.slice(1);

      // 1. Handle Map Data (PS_ tokens from custom exports)
      if (key.startsWith("PS_")) {
        const layerName = key.replace("PS_", "").toLowerCase();
        if (!preset.mapData) preset.mapData = {};
        if (!preset.mapData[layerName]) preset.mapData[layerName] = [];

        preset.mapData[layerName].push({
          x: parseInt(params[0]),
          y: parseInt(params[1]),
          v: parseInt(params[2]),
        });
        continue;
      }

      // 2. Handle Dimensions
      if (key === "DIM") {
        preset.size = parseInt(params[0]); // Using X as the source of truth for size
      }

      // 3. Handle Title
      if (key === "TITLE") {
        preset.title = params[0];
      }

      // 4. Handle Everything Else Dynamically
      // Store as string[][] to handle repeating tokens (e.g. [REGION_COUNTS:...])
      if (!preset.settings[key]) {
        preset.settings[key] = [params];
      } else {
        preset.settings[key].push(params);
      }
    }

    return preset;
  }
}
