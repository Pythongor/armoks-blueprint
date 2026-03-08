import { type Middleware } from "@reduxjs/toolkit";
import { BusEvent, EventBus } from "@tile-map/EventBus";
import {
  setActiveLayer,
  setPaintMode,
  setBrushValue,
  setBrushWidth,
  setBrushShape,
  setBrushOpacity,
  setViewMode,
  setLockedToBiomes,
} from "./slices/paintSlice";
import { worldManager } from "@tile-map/WorldManager";
import {
  setActivePreset,
  updateActiveSetting,
  addPreset,
  copyPreset,
  deletePreset,
} from "./slices/worldSlice";
import { setCoords, setBiome, setBiomeDescriptor } from "./slices/coordsSlice";
import { selectPaintSettings } from "./selectors";
import type { Biome, BiomeDescriptor } from "@/types";

export const phaserMiddleware: Middleware = (store) => {
  EventBus.on(BusEvent.UpdateCoords, (coords: { x: number; y: number }) => {
    store.dispatch(setCoords(coords));
  });

  EventBus.on(BusEvent.UpdateBiome, (biome: Biome) => {
    store.dispatch(setBiome(biome));
  });

  EventBus.on(BusEvent.UpdateBiomeDescriptor, (descriptor: BiomeDescriptor) => {
    store.dispatch(setBiomeDescriptor(descriptor));
  });

  return (next) => (action) => {
    const prevState = store.getState();
    const activeTitleBefore = prevState.world.activePresetTitle;

    const dimBefore = activeTitleBefore
      ? prevState.world.presets[activeTitleBefore]?.size
      : null;

    const result = next(action);
    const currentState = store.getState();

    if (
      setActiveLayer.match(action) ||
      setBrushValue.match(action) ||
      setViewMode.match(action) ||
      setPaintMode.match(action) ||
      setLockedToBiomes.match(action) ||
      setBrushWidth.match(action) ||
      setBrushShape.match(action) ||
      setBrushOpacity.match(action)
    ) {
      const settings = selectPaintSettings(currentState);
      EventBus.emit(BusEvent.BrushUpdated, settings);
    }

    if (setActivePreset.match(action)) {
      EventBus.emit(BusEvent.PresetSwitched, action.payload);
    }

    if (addPreset.match(action)) {
      const { title, size } = action.payload;
      worldManager.createPreset(title, size);
      EventBus.emit(BusEvent.PresetSwitched, title);
    }

    if (copyPreset.match(action)) {
      const { sourceTitle, newTitle } = action.payload;
      const sourceSize = store.getState().world.presets[newTitle].size;

      worldManager.createPreset(newTitle, sourceSize);
      worldManager.copyBufferData(sourceTitle, newTitle);
      EventBus.emit(BusEvent.PresetSwitched, newTitle);
    }

    if (deletePreset.match(action)) {
      const title = action.payload;
      worldManager.removePreset(title);

      const newActive = store.getState().world.activePresetTitle;
      if (newActive) {
        EventBus.emit(BusEvent.PresetSwitched, newActive);
      }
    }

    if (updateActiveSetting.match(action) && action.payload.key === "DIM") {
      const activeTitle = currentState.world.activePresetTitle;
      const dimAfter = activeTitle
        ? currentState.world.presets[activeTitle]?.size
        : null;

      if (activeTitle && dimAfter !== dimBefore && dimAfter !== null) {
        worldManager.resizePreset(activeTitle, dimAfter);
        EventBus.emit(BusEvent.PresetSwitched, activeTitle);
      }
    }

    return result;
  };
};
