import { useNavigate } from "react-router-dom"
import { Flex, Grid, Link, ThemeUIStyleObject, useColorMode } from "theme-ui"

import { FIR_SETTINGS } from "app/config"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { Clock } from "components/atciss/Clock"
import { NavButton } from "components/atciss/NavButton"
import { selectActiveFir, setActiveFir } from "services/configSlice"

const Nav = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeFir = useAppSelector(selectActiveFir)
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex
      sx={{
        ...sx,
        backgroundColor: "primary",
        borderBottom: 2,
        borderBottomColor: "darkShadow",
        borderBottomStyle: "solid",
        p: 2,
        gap: 2,
        alignItems: "start",
      }}
    >
      <Clock />
      <Grid
        sx={{
          gap: ".5rem",
          gridTemplateColumns: "repeat(auto-fit, 6rem)",
          gridTemplateRows: "2rem 2rem",
          flex: "auto",
        }}
      >
        <NavButton
          onClick={() => {
            navigate("/")
          }}
        >
          ATIS-AFW
        </NavButton>
        <NavButton
          onClick={() => {
            navigate("/map")
          }}
        >
          Map
        </NavButton>
        <NavButton
          onClick={() => {
            navigate("/wx")
          }}
        >
          Wx
        </NavButton>
        <NavButton
          onClick={() => {
            navigate("/loa")
          }}
        >
          LOA
        </NavButton>
        <NavButton
          onClick={() => {
            navigate("/notam")
          }}
        >
          NOTAM
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/alias")
          }}
        >
          Alias
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/windy")
          }}
        >
          Windy
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/ac")
          }}
        >
          A/C-Type
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/aip-ifr")
          }}
        >
          AIP IFR
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/aip-vfr")
          }}
        >
          AIP VFR
        </NavButton>
        <NavButton
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/bookings")
          }}
        >
          Bookings
        </NavButton>
      </Grid>
      <select
        value={activeFir}
        onChange={(e) => dispatch(setActiveFir(e.target.value))}
      >
        {Object.keys(FIR_SETTINGS).map((fir) => (
          <option key={fir}>{fir}</option>
        ))}
      </select>

      <Link
        sx={{ color: "background" }}
        onClick={() =>
          setColorMode(colorMode === "default" ? "dark" : "default")
        }
      >
        {colorMode === "default" ? <>&#x263E;</> : <>&#x263C;</>}
      </Link>
    </Flex>
  )
}

export { Nav }
