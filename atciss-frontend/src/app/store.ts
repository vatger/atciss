import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { authReducer } from "./auth/slice"
import { activePositionReducer } from "../services/activePositionSlice"
import { configReducer } from "../services/configSlice"
import { mapReducer } from "../services/mapSlice"
import { aircraftReducer } from "../services/aircraftSlice"
import { setupListeners } from "@reduxjs/toolkit/query"
import { atisAfwReducer } from "../services/atisAfwSlice"
import { notamReducer } from "../services/notamSlice"
import { idvsReducer } from "services/idvsSlice"
import { api } from "services/api"
import { loaDocsReducer } from "services/loaDocsSlice"

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    activePositions: activePositionReducer,
    aircraft: aircraftReducer,
    atisAfw: atisAfwReducer,
    auth: authReducer,
    config: configReducer,
    idvs: idvsReducer,
    map: mapReducer,
    notamView: notamReducer,
    loaDocs: loaDocsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
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
