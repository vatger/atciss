import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { Clock } from "./Clock"
import { NavButton } from "./NavButton"
import { useNavigate } from "react-router-dom"

const Nav = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const navigate = useNavigate()

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
            window.open(
              "https://www.windy.com/?700h,49.667,11.236,8",
              "atciss-windy",
              "popup=true",
            )
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
    </Flex>
  )
}

export { Nav }
