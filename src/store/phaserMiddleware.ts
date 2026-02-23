import { type Middleware } from "@reduxjs/toolkit";
import { EventBus } from "@tile-map/EventBus";
import {
  setActiveLayer,
  setBrushValue,
  setViewMode,
  setLockedToBiomes,
} from "./brushSlice";
import { setActivePreset } from "./worldSlice"; // NEW: Import the action
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
    const result = next(action);

    if (
      setActiveLayer.match(action) ||
      setBrushValue.match(action) ||
      setViewMode.match(action) ||
      setLockedToBiomes.match(action)
    ) {
      const settings = selectBrushSettings(store.getState());
      EventBus.emit("brush-updated", settings);
    }

    if (setActivePreset.match(action)) {
      EventBus.emit("preset-switched", action.payload);
    }

    return result;
  };
};
