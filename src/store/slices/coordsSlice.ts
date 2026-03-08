import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Biome, BiomeDescriptor, LayerType } from "#types";

export interface Point {
  x: number;
  y: number;
}

export interface CoordsState extends Point {
  biome: Biome;
  biomeDescriptor: BiomeDescriptor;
  layerValues: Record<LayerType, number> | null;
}

export const initialState: CoordsState = {
  x: 0,
  y: 0,
  biome: Biome.Grassland,
  biomeDescriptor: BiomeDescriptor.Calm,
  layerValues: null,
};

export const coordsSlice = createSlice({
  name: "coords",
  initialState,
  reducers: {
    setCoords: (state, action: PayloadAction<Partial<CoordsState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setCoords } = coordsSlice.actions;
