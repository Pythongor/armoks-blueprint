import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export enum LayerType {
  Elevation = "elevation",
  Rainfall = "rainfall",
  Drainage = "drainage",
  Temperature = "temperature",
  Volcanism = "volcanism",
  Savagery = "savagery",
  Alignment = "alignment",
}

interface BrushState {
  activeLayer: LayerType;
  viewMode: LayerType | "biomes";
  isLockedToBiomes: boolean;
  layerValues: Record<LayerType, number>;
}

const initialState: BrushState = {
  viewMode: "biomes",
  activeLayer: LayerType.Elevation,
  isLockedToBiomes: true,
  layerValues: {
    elevation: 100,
    rainfall: 50,
    drainage: 50,
    temperature: 50,
    volcanism: 0,
    savagery: 0,
    alignment: 50,
  },
};

export const brushSlice = createSlice({
  name: "brush",
  initialState,
  reducers: {
    setLockedToBiomes: (state, action: PayloadAction<boolean>) => {
      state.isLockedToBiomes = action.payload;
      state.viewMode = action.payload ? "biomes" : state.activeLayer;
    },
    setActiveLayer: (state, action: PayloadAction<LayerType>) => {
      state.activeLayer = action.payload;
      if (!state.isLockedToBiomes) {
        state.viewMode = action.payload;
      }
    },
    setViewMode: (state, action: PayloadAction<LayerType | "biomes">) => {
      state.viewMode = action.payload;
    },
    setBrushValue: (
      state,
      {
        payload: { layer, value },
      }: PayloadAction<{ layer: LayerType; value: number }>,
    ) => {
      state.layerValues[layer] = value;
    },
  },
});

export const { setActiveLayer, setViewMode, setBrushValue, setLockedToBiomes } =
  brushSlice.actions;
