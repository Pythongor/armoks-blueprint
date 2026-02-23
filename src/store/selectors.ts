import { type RootState } from "./index";

export const selectActiveBrushValue = (state: RootState) => {
  const { activeLayer, layerValues } = state.brush;
  return layerValues[activeLayer];
};

export type BrushSettings = {
  activeLayer: RootState["brush"]["activeLayer"];
  viewMode: RootState["brush"]["viewMode"];
  brushValue: number;
};

export const selectBrushSettings = (state: RootState): BrushSettings => {
  const { activeLayer, viewMode } = state.brush;
  return {
    activeLayer,
    viewMode,
    brushValue: selectActiveBrushValue(state),
  };
};

export const selectActivePreset = (state: RootState) =>
  state.world.activePresetTitle
    ? state.world.presets[state.world.activePresetTitle]
    : null;

export const selectActiveSettings = (state: RootState) =>
  selectActivePreset(state)?.settings || {};
