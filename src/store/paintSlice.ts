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

interface PaintState {
  activeLayer: LayerType;
  viewMode: LayerType | "biomes";
  isLockedToBiomes: boolean;
  layerValues: Record<LayerType, number>;
  brushWidth: number;
  brushShape: BrushShape;
  opacity: number;
}

const initialState: PaintState = {
  viewMode: "biomes",
  activeLayer: LayerType.Elevation,
  isLockedToBiomes: true,
  brushWidth: 1,
  brushShape: BrushShape.Square,
  opacity: 1,
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

export const paintSlice = createSlice({
  name: "paint",
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
    setBrushWidth: (state, action: PayloadAction<number>) => {
      state.brushWidth = action.payload;
    },
    setBrushShape: (state, action: PayloadAction<BrushShape>) => {
      state.brushShape = action.payload;
    },
    setBrushOpacity: (state, action: PayloadAction<number>) => {
      state.opacity = action.payload;
    },
  },
});

export const {
  setLockedToBiomes,
  setActiveLayer,
  setViewMode,
  setBrushValue,
  setBrushWidth,
  setBrushShape,
  setBrushOpacity,
} = paintSlice.actions;
