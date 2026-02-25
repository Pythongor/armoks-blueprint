import { brushSlice } from "./brushSlice";
import { configureStore } from "@reduxjs/toolkit";
import { coordsSlice } from "./coordsSlice";
import { phaserMiddleware } from "./phaserMiddleware";
import { uiSlice } from "./uiSlice";
import { worldSlice } from "./worldSlice";

export const store = configureStore({
  reducer: {
    brush: brushSlice.reducer,
    world: worldSlice.reducer,
    coords: coordsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(phaserMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
