import { Box, Flex, ThemeUIProvider } from "theme-ui"
import { Outlet } from "react-router-dom"
import { theme } from "app/idvs/theme"

const Idvs = () => (
  <ThemeUIProvider theme={theme}>
    <Flex sx={{ flexDirection: "column", height: "100vh" }}>
      <Box>IDVS</Box>
      <Flex sx={{ flex: "auto", overflow: "auto" }}>
        <Outlet />
      </Flex>
    </Flex>
  </ThemeUIProvider>
)

export { Idvs }
