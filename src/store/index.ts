import { configureStore } from "@reduxjs/toolkit";
import { brushSlice } from "./brushSlice";
import { coordsSlice } from "./coordsSlice";
import { phaserMiddleware } from "./phaserMiddleware";

export const store = configureStore({
  reducer: {
    brush: brushSlice.reducer,
    coords: coordsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(phaserMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
