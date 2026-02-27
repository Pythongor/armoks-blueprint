import type { WorldPreset } from "@/types";

const tokenRegex = /\[([^\]]+)\]/g;

export class WorldGenToJson {
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

      if (key.startsWith("PS_")) {
        const layerSuffix = key.replace("PS_", "").toUpperCase(); // e.g., "EL"

        if (!preset.mapData) preset.mapData = {};
        if (!preset.mapData[layerSuffix]) preset.mapData[layerSuffix] = [];

        // We track which row we are on by counting how many
        // tokens of this type we've already seen
        const currentY = preset.mapData[layerSuffix].length / preset.size;
        const rowIndex = Math.floor(currentY);

        // Loop through every value in this single bracket [PS_EL:v1:v2:v3...]
        params.forEach((val, xIndex) => {
          preset.mapData![layerSuffix].push({
            x: xIndex,
            y: rowIndex,
            v: parseInt(val),
          });
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
        continue;
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
