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

export enum BrushShape {
  Square = "square",
  Circle = "circle",
}

interface BrushState {
  activeLayer: LayerType;
  viewMode: LayerType | "biomes";
  isLockedToBiomes: boolean;
  layerValues: Record<LayerType, number>;
  brushSize: number;
  brushShape: BrushShape;
}

const initialState: BrushState = {
  viewMode: "biomes",
  activeLayer: LayerType.Elevation,
  isLockedToBiomes: true,
  brushSize: 1,
  brushShape: BrushShape.Square,
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
    setBrushSize: (state, action: PayloadAction<number>) => {
      state.brushSize = action.payload;
    },
    setBrushShape: (state, action: PayloadAction<BrushShape>) => {
      state.brushShape = action.payload;
    },
  },
});

export const {
  setLockedToBiomes,
  setActiveLayer,
  setViewMode,
  setBrushValue,
  setBrushSize,
  setBrushShape,
} = brushSlice.actions;
