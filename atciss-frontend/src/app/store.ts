import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/dist/query"
import { metarApi } from "../services/metarApi"
import { atisApi } from "../services/atisApi"

export const store = configureStore({
  reducer: {
    [metarApi.reducerPath]: metarApi.reducer,
    [atisApi.reducerPath]: atisApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(metarApi.middleware)
      .concat(atisApi.middleware),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
