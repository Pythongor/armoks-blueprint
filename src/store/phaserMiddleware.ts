import { type Middleware } from "@reduxjs/toolkit";
import { EventBus } from "@tile-map/EventBus";
import {
  setActiveLayer,
  setBrushValue,
  setViewMode,
  setLockedToBiomes,
} from "./brushSlice";
import { setCoords, setBiome } from "./coordsSlice";
import { selectBrushSettings } from "./selectors";
import type { Biome } from "@/types";

export const phaserMiddleware: Middleware = (store) => {
  EventBus.on("update-coords", (coords: { x: number; y: number }) => {
    store.dispatch(setCoords(coords));
  });

  EventBus.on("update-biome", (biome: Biome) => {
    store.dispatch(setBiome(biome));
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

    return result;
  };
};
