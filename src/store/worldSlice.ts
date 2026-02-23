import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
        const settings = state.presets[activeTitle].settings;
        if (settings[key]) {
          settings[key][index] = params;
        } else {
          settings[key] = [params];
        }
      }
    },

    resetWorld: () => initialState,
  },
});

export const {
  initializeWorld,
  setActivePreset,
  updateActiveSetting,
  resetWorld,
} = worldSlice.actions;

export default worldSlice.reducer;
