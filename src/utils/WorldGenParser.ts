export interface DFWorldJson {
  title?: string;
  dimensions?: { width: number; height: number };
  // Holds all standard tokens like [RAINFALL:0:100:101:101]
  settings: Record<string, string[][]>;
  // Holds all coordinate data [PS_ELEVATION:x:y:v]
  mapData: Record<string, { x: number; y: number; v: number }[]>;
}

// Regex to grab everything between [ and ]
const tokenRegex = /\[([^\]]+)\]/g;

export class WorldGenToUniversalJson {
  static parse(input: string): DFWorldJson {
    const world: DFWorldJson = {
      settings: {},
      mapData: {},
    };

    let match;

    while ((match = tokenRegex.exec(input)) !== null) {
      const parts = match[1].split(":");
      const key = parts[0];
      const params = parts.slice(1);

      // 1. Handle Map Data (PS_ tokens)
      if (key.startsWith("PS_")) {
        const layerName = key.replace("PS_", "").toLowerCase();
        if (!world.mapData[layerName]) world.mapData[layerName] = [];

        world.mapData[layerName].push({
          x: parseInt(params[0]),
          y: parseInt(params[1]),
          v: parseInt(params[2]),
        });
        continue;
      }

      // 2. Handle Dimension Shortcut
      if (key === "DIM") {
        world.dimensions = {
          width: parseInt(params[0]),
          height: parseInt(params[1]),
        };
      }

      // 3. Handle Title Shortcut
      if (key === "TITLE") {
        world.title = params[0];
      }

      // 4. Handle Everything Else Dynamically
      // We store as string[][] to handle tokens that repeat (like [ALLOWED_CREATURE:X])
      if (!world.settings[key]) {
        world.settings[key] = [params];
      } else {
        world.settings[key].push(params);
      }
    }

    return world;
  }
}
