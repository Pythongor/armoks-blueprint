import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Biome, BiomeDescriptor } from "#types";

interface CoordsState {
  x: number;
  y: number;
  biome: Biome;
  biomeDescriptor: BiomeDescriptor;
}

export const initialState: CoordsState = {
  x: 0,
  y: 0,
  biome: Biome.Grassland,
  biomeDescriptor: BiomeDescriptor.Calm,
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
    setBiomeDescriptor: (state, action: PayloadAction<BiomeDescriptor>) => {
      state.biomeDescriptor = action.payload;
    },
  },
});

export const { setCoords, setBiome, setBiomeDescriptor } = coordsSlice.actions;
