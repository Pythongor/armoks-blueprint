import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Biome } from "@/types";

interface CoordsState {
  x: number;
  y: number;
  biome: Biome;
}

export const initialState: CoordsState = {
  x: 0,
  y: 0,
  biome: Biome.Grassland,
};

export const coordsSlice = createSlice({
  name: "coords",
  initialState,
  reducers: {
    setCoords: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
    setBiome: (state, action: PayloadAction<Biome>) => {
      state.biome = action.payload;
    },
  },
});

export const { setCoords, setBiome } = coordsSlice.actions;
