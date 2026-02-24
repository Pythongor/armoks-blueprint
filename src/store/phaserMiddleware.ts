import { type Middleware } from "@reduxjs/toolkit";
import { EventBus } from "@tile-map/EventBus";
import {
  setActiveLayer,
  setBrushValue,
  setViewMode,
  setLockedToBiomes,
} from "./brushSlice";
import { worldManager } from "@tile-map/WorldManager";
import { setActivePreset, updateActiveSetting } from "./worldSlice";
import { setCoords, setBiome, setBiomeDescriptor } from "./coordsSlice";
import { selectBrushSettings } from "./selectors";
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
      setLockedToBiomes.match(action)
    ) {
      const settings = selectBrushSettings(currentState);
      EventBus.emit("brush-updated", settings);
    }

    if (setActivePreset.match(action)) {
      EventBus.emit("preset-switched", action.payload);
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
