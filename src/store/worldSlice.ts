import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const nonDestructiveConfig: Record<string, string[] | string[][]> = {
  EROSION_CYCLE_COUNT: ["0"],
  PERIODICALLY_ERODE_EXTREMES: ["0"],
  OROGRAPHIC_PRECIPITATION: ["0"],
  POLE: ["NONE"],
  ELEVATION: ["0", "400", "400", "400"],
  RAINFALL: ["0", "100", "400", "400"],
  TEMPERATURE: ["0", "100", "400", "400"],
  DRAINAGE: ["0", "100", "400", "400"],
  VOLCANISM: ["0", "100", "400", "400"],
  SAVAGERY: ["0", "100", "400", "400"],
  VOLCANO_MIN: ["0"],
  PEAK_NUMBER_MIN: ["0"],
  RIVER_MINS: ["0"],
  PARTIAL_OCEAN_EDGE_MIN: ["0"],
  COMPLETE_OCEAN_EDGE_MIN: ["0"],
  SUBREGION_MAX: ["5000"],
  REGION_COUNTS: [
    ["SWAMP", "0", "0", "0"],
    ["DESERT", "0", "0", "0"],
    ["FOREST", "0", "0", "0"],
    ["MOUNTAINS", "0", "0", "0"],
    ["OCEAN", "0", "0", "0"],
    ["GLACIER", "0", "0", "0"],
    ["TUNDRA", "0", "0", "0"],
    ["GRASSLAND", "0", "0", "0"],
    ["HILLS", "0", "0", "0"],
  ],
  ELEVATION_RANGES: ["0", "0", "0"],
  RAIN_RANGES: ["0", "0", "0"],
  DRAINAGE_RANGES: ["0", "0", "0"],
  VOLCANISM_RANGES: ["0", "0", "0"],
  SAVAGERY_RANGES: ["0", "0", "0"],
  ELEVATION_FREQUENCY: ["1", "1", "1", "1", "1", "1"],
  RAIN_FREQUENCY: ["1", "1", "1", "1", "1", "1"],
  DRAINAGE_FREQUENCY: ["1", "1", "1", "1", "1", "1"],
  VOLCANISM_FREQUENCY: ["1", "1", "1", "1", "1", "1"],
  SAVAGERY_FREQUENCY: ["1", "1", "1", "1", "1", "1"],
  GOOD_SQ_COUNTS: ["0", "0", "0"],
  EVIL_SQ_COUNTS: ["0", "0", "0"],
};

export interface WorldPreset {
  title: string;
  size: number;
  settings: Record<string, string[][]>;
}

export interface WorldState {
  presets: Record<string, WorldPreset>;
  activePresetTitle: string | null;
  isInitialized: boolean;
}

export const initialState: WorldState = {
  presets: {},
  activePresetTitle: null,
  isInitialized: false,
};

export const worldSlice = createSlice({
  name: "world",
  initialState,
  reducers: {
    initializeWorld: (state, action: PayloadAction<WorldPreset[]>) => {
      const presetsArray = action.payload;

      state.presets = presetsArray.reduce(
        (acc, preset) => {
          acc[preset.title] = preset;
          return acc;
        },
        {} as Record<string, WorldPreset>,
      );

      if (presetsArray.length > 0) {
        state.activePresetTitle = presetsArray[0].title;
      }

      state.isInitialized = true;
    },

    setActivePreset: (state, action: PayloadAction<string>) => {
      if (state.presets[action.payload]) {
        state.activePresetTitle = action.payload;
      }
    },

    updateActiveSetting: (
      state,
      action: PayloadAction<{ key: string; index: number; params: string[] }>,
    ) => {
      const { key, index, params } = action.payload;
      const activeTitle = state.activePresetTitle;

      if (activeTitle && state.presets[activeTitle]) {
        const preset = state.presets[activeTitle];

        if (preset.settings[key]) {
          preset.settings[key][index] = params;
        } else {
          preset.settings[key] = [params];
        }

        if (key === "DIM") {
          const newSize = parseInt(params[0]);
          if (!isNaN(newSize)) {
            preset.size = newSize;
          }
        }
      }
    },

    applyDestructionSafetyDefaults: (state) => {
      const activeTitle = state.activePresetTitle;
      if (!activeTitle || !state.presets[activeTitle]) return;

      const settings = state.presets[activeTitle].settings;

      Object.entries(nonDestructiveConfig).forEach(([key, value]) => {
        if (settings[key]) {
          if (Array.isArray(value[0])) {
            settings[key] = value as string[][];
          } else {
            settings[key][0] = value as string[];
          }
        }
      });
    },

    renameActivePreset: (state, action: PayloadAction<string>) => {
      const oldTitle = state.activePresetTitle;
      const newTitle = action.payload.trim();

      if (!oldTitle || !newTitle || oldTitle === newTitle) return;

      if (state.presets[newTitle]) {
        console.warn("A blueprint with this name already exists!");
        return;
      }

      const presetData = state.presets[oldTitle];

      presetData.title = newTitle;
      state.presets[newTitle] = presetData;
      delete state.presets[oldTitle];
      state.activePresetTitle = newTitle;
    },

    resetWorld: () => initialState,
  },
});

export const {
  initializeWorld,
  setActivePreset,
  updateActiveSetting,
  applyDestructionSafetyDefaults,
  resetWorld,
  renameActivePreset,
} = worldSlice.actions;

export default worldSlice.reducer;
