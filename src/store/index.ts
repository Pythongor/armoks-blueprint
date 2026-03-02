import { configureStore } from "@reduxjs/toolkit";
import { coordsSlice } from "./coordsSlice";
import { gallerySlice } from "./gallerySlice";
import { paintSlice } from "./paintSlice";
import { phaserMiddleware } from "./phaserMiddleware";
import { uiSlice } from "./uiSlice";
import { worldSlice } from "./worldSlice";

export const store = configureStore({
  reducer: {
    coords: coordsSlice.reducer,
    gallery: gallerySlice.reducer,
    paint: paintSlice.reducer,
    world: worldSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(phaserMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
