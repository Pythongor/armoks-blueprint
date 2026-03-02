import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WorldPreset } from "@/types";

interface GalleryState {
  availableBlueprints: WorldPreset[];
  selectedTitles: string[];
}

const initialState: GalleryState = {
  availableBlueprints: [],
  selectedTitles: [],
};

export const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    setAvailableBlueprints: (state, action: PayloadAction<WorldPreset[]>) => {
      state.availableBlueprints = action.payload;
      if (action.payload.length > 0)
        state.selectedTitles = [action.payload[0].title];
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      const title = action.payload;
      if (state.selectedTitles.includes(title)) {
        if (state.selectedTitles.length > 1) {
          state.selectedTitles = state.selectedTitles.filter(
            (t) => t !== title,
          );
        }
      } else {
        state.selectedTitles.push(title);
      }
    },
  },
});

export const { setAvailableBlueprints, toggleSelection } = gallerySlice.actions;
