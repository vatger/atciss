import {
  combineReducers,
  configureStore,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit"
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
import { windApi } from "services/windApi"

export const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [windApi.reducerPath]: windApi.reducer,
  activePositions: activePositionReducer,
  aircraft: aircraftReducer,
  atisAfw: atisAfwReducer,
  auth: authReducer,
  config: configReducer,
  idvs: idvsReducer,
  map: mapReducer,
  notamView: notamReducer,
  loaDocs: loaDocsReducer,
})

export const store = configureStore({
  reducer: appReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, windApi.middleware),
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
