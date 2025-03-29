import { theme } from "app/idvs/theme"
import { Footer } from "components/atciss/Footer"
import { Attention } from "components/idvs/Attention"
import { Nav } from "components/idvs/Nav"
import { Outlet } from "react-router"
import { Flex, ThemeUIProvider } from "theme-ui"

const Idvs = () => (
  <ThemeUIProvider theme={theme}>
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Nav sx={{ flex: "none" }} />
      <Flex
        sx={{
          flex: "auto",
          overflow: "auto",
          borderBottom: 2,
          borderBottomColor: "darkShadow",
          borderBottomStyle: "solid",
        }}
      >
        <Outlet />
      </Flex>
      <Attention />
      <Footer sx={{ flex: "none" }} />
    </Flex>
  </ThemeUIProvider>
)

export { Idvs }
