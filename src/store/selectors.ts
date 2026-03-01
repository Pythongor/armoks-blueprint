import type { BrushShape, LayerType, PaintMode } from "./paintSlice";
import { type RootState } from "./index";

export const selectActiveBrushValue = (state: RootState) => {
  const { activeLayer, layerValues } = state.paint;
  return layerValues[activeLayer];
};

export type PaintSettings = {
  activeLayer: LayerType;
  viewMode: LayerType | "biomes";
  paintMode: PaintMode;
  brushValue: number;
  brushWidth: number;
  brushShape: BrushShape;
  opacity: number;
};

export const selectPaintSettings = (state: RootState): PaintSettings => {
  const { activeLayer, viewMode, paintMode, brushWidth, brushShape, opacity } =
    state.paint;
  return {
    activeLayer,
    viewMode,
    paintMode,
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
