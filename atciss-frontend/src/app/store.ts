import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/dist/query"
import { metarApi } from "../services/metarApi";

export const store = configureStore({
  reducer: {
    [metarApi.reducerPath]: metarApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(metarApi.middleware)
})

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
