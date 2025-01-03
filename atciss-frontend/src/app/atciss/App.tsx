import { theme } from "app/atciss/theme"
import { Footer } from "components/atciss/Footer"
import { Nav } from "components/atciss/Nav"
import { Outlet } from "react-router"
import { Flex, ThemeUIProvider } from "theme-ui"

const Atciss = () => (
  <ThemeUIProvider theme={theme}>
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Nav sx={{ flex: "none" }} />
      <Flex sx={{ flex: "auto", overflow: "auto" }}>
        <Outlet />
      </Flex>
      <Footer sx={{ flex: "none" }} />
    </Flex>
  </ThemeUIProvider>
)

export { Atciss }
