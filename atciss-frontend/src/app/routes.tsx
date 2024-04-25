import { Atciss } from "app/atciss/App"
import {
  Auth,
  AuthCallback,
  Logout,
  RequireAdmin,
  RequireAuth,
  authCallbackLoader,
} from "app/auth"
import { Idvs } from "app/idvs/App"
import { createBrowserRouter } from "react-router-dom"
import { Admin } from "views/Admin"
import { TrafficBoard } from "views/TrafficBoard"
import { AipIfr } from "views/atciss/AipIfr"
import { AipVfr } from "views/atciss/AipVfr"
import { AircraftData } from "views/atciss/AircraftData"
import { Alias } from "views/atciss/Alias"
import { AtisAfw } from "views/atciss/AtisAfw"
import { LOA } from "views/atciss/LOA"
import { Map } from "views/atciss/Map"
import { Notams } from "views/atciss/Notam"
import { Windy } from "views/atciss/Windy"
import { Wx } from "views/atciss/Wx"
import { Afw } from "views/idvs/Afw"
// import { Bookings } from "src/views/Bookings"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Atciss />
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
        path: "/admin",
        element: (
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        ),
      },
    ],
  },
  {
    path: "/idvs",
    element: (
      <RequireAuth>
        <Idvs />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Afw />,
      },
      {
        path: "atis",
        element: <>ATIS</>,
      },
      {
        path: "opmet",
        element: <>OPMET</>,
      },
      {
        path: "notam",
        element: <>NOTAM</>,
      },
      {
        path: "info",
        element: <>ℹ️</>,
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
