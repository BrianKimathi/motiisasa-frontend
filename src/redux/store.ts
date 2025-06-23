// store.ts
import { configureStore } from "@reduxjs/toolkit";
import carsReducer from "./carsSlice";

export const store = configureStore({
  reducer: {
    cars: carsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
