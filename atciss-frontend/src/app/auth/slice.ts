import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { selectActiveFir } from "services/configSlice"

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

const tokenClaimsValid = (claims: TokenClaims | null) => {
  if (claims === null) return false
  return claims.exp * 1000 > Date.now()
}

export const LOCAL_STORAGE_ACCESS_KEY = "atciss_access"
export const LOCAL_STORAGE_REFRESH_KEY = "atciss_refresh"

interface TokenClaims {
  sub: string
  exp: number
}

interface User extends TokenClaims {
  admin: boolean
  fir_admin: string[]
}

interface AuthState {
  user: User | null
}

export interface AuthResponse {
  access: string
  refresh: string
}

const getUserWithExpiryCheck = (jwt: string | null): User | null => {
  const refresh: string | null = localStorage.getItem(LOCAL_STORAGE_REFRESH_KEY)
  if (!jwt || !refresh) return null

  const claims: User = parseJwt(jwt)
  if (tokenClaimsValid(claims) || tokenClaimsValid(parseJwt(refresh))) {
    return claims
  } else {
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_KEY)
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_KEY)
    return null
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getUserWithExpiryCheck(
      localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY),
    ),
  } as AuthState,
  reducers: {
    login(state, action: PayloadAction<AuthResponse>) {
      const payload = action.payload
      localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, payload.access)
      localStorage.setItem(LOCAL_STORAGE_REFRESH_KEY, payload.refresh)
      state.user = getUserWithExpiryCheck(payload.access)
    },
    logout(state) {
      localStorage.removeItem(LOCAL_STORAGE_ACCESS_KEY)
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_KEY)
      state.user = null
    },
  },
})

export const selectUser = (store: RootState) => store.auth.user
export const selectIsFirAdmin = createSelector(
  selectUser,
  selectActiveFir,
  (user, fir) => user?.fir_admin?.includes(fir) ?? false,
)

export const { login, logout } = authSlice.actions
export const { reducer: authReducer } = authSlice
