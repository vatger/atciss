/** @jsxImportSource theme-ui */

import { Link } from "react-router"
import { Button, Flex, Grid, ThemeUIStyleObject, useColorMode } from "theme-ui"

const Nav = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Flex
      sx={{
        ...sx,
        borderBottom: 2,
        borderBottomColor: "darkShadow",
        borderBottomStyle: "solid",
        alignItems: "start",
      }}
    >
      <Grid
        sx={{
          gap: 0,
          gridTemplateColumns: "repeat(auto-fit, 6rem)",
          gridTemplateRows: "3rem",
          flex: "auto",
        }}
      >
        <Link to="">
          <Button variant="nav">AFW</Button>
        </Link>
        <Link to="atis">
          <Button variant="nav">ATIS</Button>
        </Link>
        <Link to="opmet">
          <Button variant="nav">OPMET</Button>
        </Link>
        <Link to="notam">
          <Button variant="nav">NOTAM</Button>
        </Link>
        <Link to="info">
          <Button variant="nav">info</Button>
        </Link>
        <Link to="/">
          <Button variant="nav">ATCISS</Button>
        </Link>
        <Button
          variant="nav"
          onClick={() =>
            setColorMode(colorMode === "default" ? "dark" : "default")
          }
        >
          {colorMode === "default" ? <>&#x263E;</> : <>&#x263C;</>}
        </Button>
      </Grid>
    </Flex>
  )
}

export { Nav }
