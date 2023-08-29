import React, { useEffect } from "react"
import {
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { useAppDispatch, useAppSelector } from "./hooks"
import { VATSIM_AUTH_URL, VATSIM_CLIENT_ID } from "./config"
import { LOCAL_STORAGE_JWT_KEY, login, logout, selectUser } from "./auth/slice"
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query"

export const RequireAuth = ({ children }: { children?: JSX.Element }) => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: location } })
    }
  }, [user, navigate, location])

  return children || <></>
}

export const authLoader = async () => {
  window.location.replace(
    `${VATSIM_AUTH_URL}/oauth/authorize?client_id=${VATSIM_CLIENT_ID}&redirect_uri=${window.location.protocol}//${window.location.host}%2Fauth%2Fcallback&response_type=code&scope=vatsim_details+country`,
  )

  return null
}

export const Auth = () => {
  return <>Redirecting</>
}

export const fetchWithAuth = fetchBaseQuery({
  baseUrl: "/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY)

    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
  responseHandler: async (response) => {
    if (response.status === 401) {
      location.replace("/auth")
    }

    const text = await response.text()
    return text.length ? JSON.parse(text) : null
  },
})

export const authCallbackLoader = async () => {
  const query = new URL(window.location.href).searchParams
  const code = query.get("code")

  const response = await fetch(`/api/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  })

  if (response.status >= 400) {
    return redirect("/auth")
  }

  return response
}

export const AuthCallback = () => {
  const data = useLoaderData() as { jwt: string }
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user) {
      navigate("/")
    } else {
      dispatch(login(data.jwt))
    }
  }, [dispatch, navigate, user, data.jwt])

  return <>{JSON.stringify(user)}</>
}

export const Logout = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user) dispatch(logout())
  }, [dispatch, user])

  return <>{user ? "Logging out" : "Logged out"}</>
}
