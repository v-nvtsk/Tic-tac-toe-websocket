import { configureStore } from "@reduxjs/toolkit";
import { FieldState, fieldSlice } from "./fieldSlice";

export type StoreRootState = {
  field: FieldState;
};

export const store = configureStore({
  reducer: {
    field: fieldSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
