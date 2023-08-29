import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"

const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )

  return JSON.parse(jsonPayload)
}

export const LOCAL_STORAGE_JWT_KEY = "atciss_jwt"

interface User {
  cid: string
  exp: number
}

interface AuthState {
  user: User | null
}

const getUserWithExpiryCheck = (jwt: string | null): User | null => {
  if (!jwt) return null

  const claims = parseJwt(jwt)
  if (claims.exp * 1000 > Date.now()) {
    return { exp: claims.exp, cid: claims.sub }
  } else {
    localStorage.removeItem(LOCAL_STORAGE_JWT_KEY)
    return null
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getUserWithExpiryCheck(localStorage.getItem(LOCAL_STORAGE_JWT_KEY)),
  } as AuthState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      const jwt = action.payload
      localStorage.setItem(LOCAL_STORAGE_JWT_KEY, jwt)
      state.user = getUserWithExpiryCheck(jwt)
    },
    logout(state) {
      localStorage.removeItem(LOCAL_STORAGE_JWT_KEY)
      state.user = null
    },
  },
})

export const selectUser = (store: RootState) => store.auth.user

export const { login, logout } = authSlice.actions
export const { reducer: authReducer } = authSlice
