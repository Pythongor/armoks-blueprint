import type { BrushShape } from "./paintSlice";
import { type RootState } from "./index";

export const selectActiveBrushValue = (state: RootState) => {
  const { activeLayer, layerValues } = state.paint;
  return layerValues[activeLayer];
};

export type BrushSettings = {
  activeLayer: RootState["paint"]["activeLayer"];
  viewMode: RootState["paint"]["viewMode"];
  brushValue: number;
  brushWidth: number;
  brushShape: BrushShape;
  opacity: number;
};

export const selectBrushSettings = (state: RootState): BrushSettings => {
  const { activeLayer, viewMode, brushWidth, brushShape, opacity } =
    state.paint;
  return {
    activeLayer,
    viewMode,
    brushValue: selectActiveBrushValue(state),
    brushWidth,
    brushShape,
    opacity,
  };
};

export const selectActivePreset = (state: RootState) =>
  state.world.activePresetTitle
    ? state.world.presets[state.world.activePresetTitle]
    : null;

export const selectActiveSettings = (state: RootState) =>
  selectActivePreset(state)?.settings || {};
