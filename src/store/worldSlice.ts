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
  resetWorld,
  renameActivePreset,
} = worldSlice.actions;

export default worldSlice.reducer;
