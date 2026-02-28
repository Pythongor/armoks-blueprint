import type { BrushShape } from "./brushSlice";
import { type RootState } from "./index";

export const selectActiveBrushValue = (state: RootState) => {
  const { activeLayer, layerValues } = state.brush;
  return layerValues[activeLayer];
};

export type BrushSettings = {
  activeLayer: RootState["brush"]["activeLayer"];
  viewMode: RootState["brush"]["viewMode"];
  brushValue: number;
  brushSize: number;
  brushShape: BrushShape;
};

export const selectBrushSettings = (state: RootState): BrushSettings => {
  const { activeLayer, viewMode, brushSize, brushShape } = state.brush;
  return {
    activeLayer,
    viewMode,
    brushValue: selectActiveBrushValue(state),
    brushSize,
    brushShape,
  };
};

export const selectActivePreset = (state: RootState) =>
  state.world.activePresetTitle
    ? state.world.presets[state.world.activePresetTitle]
    : null;

export const selectActiveSettings = (state: RootState) =>
  selectActivePreset(state)?.settings || {};
