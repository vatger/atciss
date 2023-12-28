import { createBrowserRouter } from "react-router-dom"
import { AtisAfw } from "../views/AtisAfw"
import { Map } from "../views/Map"
import { Wx } from "../views/Wx"
import { App } from "../App"
import { Notams } from "../views/Notam"
import {
  Auth,
  AuthCallback,
  Logout,
  RequireAdmin,
  RequireAuth,
  authCallbackLoader,
} from "./auth"
import { LOA } from "../views/LOA"
import { AipIfr } from "../views/AipIfr"
import { AipVfr } from "../views/AipVfr"
import { Windy } from "../views/Windy"
import { Alias } from "../views/Alias"
import { AircraftData } from "../views/AircraftData"
import { TrafficBoard } from "../views/TrafficBoard"
import { Admin } from "../views/Admin"
// import { Bookings } from "../views/Bookings"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      {
        path: "/",
        element: <AtisAfw sx={{ flex: "auto" }} />,
      },
      {
        path: "map",
        element: <Map />,
      },
      {
        path: "alias",
        element: <Alias />,
      },
      {
        path: "wx",
        element: <Wx />,
      },
      {
        path: "ac",
        element: <AircraftData />,
      },
      // {
      //   path: "bookings",
      //   element: <Bookings />,
      // },
      {
        path: "windy",
        element: <Windy />,
      },
      {
        path: "notam",
        element: <Notams />,
      },
      {
        path: "loa",
        element: <LOA />,
      },
      {
        path: "aip-ifr",
        element: <AipIfr />,
      },
      {
        path: "aip-vfr",
        element: <AipVfr />,
      },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/traffic/:icao/:type",
    element: <TrafficBoard />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
    loader: authCallbackLoader,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
])

export default router
