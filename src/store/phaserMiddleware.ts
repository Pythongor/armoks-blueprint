import { type Middleware } from "@reduxjs/toolkit";
import { EventBus } from "@tile-map/EventBus";
import {
  setActiveLayer,
  setPaintMode,
  setBrushValue,
  setBrushWidth,
  setBrushShape,
  setBrushOpacity,
  setViewMode,
  setLockedToBiomes,
} from "./paintSlice";
import { worldManager } from "@tile-map/WorldManager";
import {
  setActivePreset,
  updateActiveSetting,
  addPreset,
  copyPreset,
  deletePreset,
} from "./worldSlice";
import { setCoords, setBiome, setBiomeDescriptor } from "./coordsSlice";
import { selectPaintSettings } from "./selectors";
import type { Biome, BiomeDescriptor } from "@/types";

export const phaserMiddleware: Middleware = (store) => {
  EventBus.on("update-coords", (coords: { x: number; y: number }) => {
    store.dispatch(setCoords(coords));
  });

  EventBus.on("update-biome", (biome: Biome) => {
    store.dispatch(setBiome(biome));
  });

  EventBus.on("update-biome-descriptor", (descriptor: BiomeDescriptor) => {
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
      EventBus.emit("brush-updated", settings);
    }

    if (setActivePreset.match(action)) {
      EventBus.emit("preset-switched", action.payload);
    }

    if (addPreset.match(action)) {
      const { title, size } = action.payload;
      worldManager.createPreset(title, size);
      EventBus.emit("preset-switched", title);
    }

    if (copyPreset.match(action)) {
      const { sourceTitle, newTitle } = action.payload;
      const sourceSize = store.getState().world.presets[newTitle].size;

      worldManager.createPreset(newTitle, sourceSize);
      worldManager.copyBufferData(sourceTitle, newTitle);
      EventBus.emit("preset-switched", newTitle);
    }

    if (deletePreset.match(action)) {
      const title = action.payload;
      worldManager.removePreset(title);

      const newActive = store.getState().world.activePresetTitle;
      if (newActive) {
        EventBus.emit("preset-switched", newActive);
      }
    }

    if (updateActiveSetting.match(action) && action.payload.key === "DIM") {
      const activeTitle = currentState.world.activePresetTitle;
      const dimAfter = activeTitle
        ? currentState.world.presets[activeTitle]?.size
        : null;

      if (activeTitle && dimAfter !== dimBefore && dimAfter !== null) {
        worldManager.resizePreset(activeTitle, dimAfter);
        EventBus.emit("preset-switched", activeTitle);
      }
    }

    return result;
  };
};
