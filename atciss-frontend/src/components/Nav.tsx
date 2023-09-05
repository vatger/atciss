import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { Clock } from "./Clock"
import { NavButton } from "./NavButton"
import { useNavigate } from "react-router-dom"
import { EBG_SETTINGS } from "../app/config"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectActiveEbg, setActiveEbg } from "../services/configSlice"

const Nav = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeEbg = useAppSelector(selectActiveEbg)

  return (
    <Flex
      sx={{
        ...sx,
        backgroundColor: "primary",
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
          sx={{ gridRow: "2/3" }}
          onClick={() => {
            navigate("/wx")
          }}
        >
          Wx
        </NavButton>
        <NavButton
          onClick={() => {
            navigate("/notam")
          }}
        >
          NOTAM
        </NavButton>
      </Grid>
      <select
        value={activeEbg}
        onChange={(e) => dispatch(setActiveEbg(e.target.value))}
      >
        {Object.keys(EBG_SETTINGS).map((ebg) => (
          <option key={ebg}>{ebg}</option>
        ))}
      </select>
    </Flex>
  )
}

export { Nav }
