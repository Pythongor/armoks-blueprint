import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const coordsSlice = createSlice({
  name: "coords",
  initialState: { x: 0, y: 0 },
  reducers: {
    setCoords: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
  },
});

export const { setCoords } = coordsSlice.actions;
