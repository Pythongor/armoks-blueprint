import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WorldState {
  title: string;
  size: number;
  // Dynamic settings: key is token (e.g., "END_YEAR"),
  // value is array of parameter arrays (e.g., [["250"]])
  settings: Record<string, string[][]>;
  isInitialized: boolean;
}

export const initialState: WorldState = {
  title: "Untitled World",
  size: 129,
  settings: {},
  isInitialized: false,
};

export const worldSlice = createSlice({
  name: "world",
  initialState,
  reducers: {
    initializeWorld: (
      state,
      action: PayloadAction<{
        title?: string;
        size: number;
        settings?: Record<string, string[][]>;
      }>,
    ) => {
      state.title = action.payload.title || "New World";
      state.size = action.payload.size;
      state.settings = action.payload.settings || {};
      state.isInitialized = true;
    },
    updateSetting: (
      state,
      action: PayloadAction<{ key: string; index: number; params: string[] }>,
    ) => {
      const { key, index, params } = action.payload;
      if (state.settings[key]) {
        state.settings[key][index] = params;
      } else {
        state.settings[key] = [params];
      }
    },
    addSettingOccurrence: (
      state,
      action: PayloadAction<{ key: string; params: string[] }>,
    ) => {
      const { key, params } = action.payload;
      if (!state.settings[key]) {
        state.settings[key] = [];
      }
      state.settings[key].push(params);
    },

    resetWorld: () => {
      return initialState;
    },
  },
});

export const {
  initializeWorld,
  updateSetting,
  addSettingOccurrence,
  resetWorld,
} = worldSlice.actions;

export default worldSlice.reducer;
