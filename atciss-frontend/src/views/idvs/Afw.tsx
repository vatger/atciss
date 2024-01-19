import { BaroClock } from "components/idvs/BaroClock"
import { Wind } from "components/idvs/Wind"
import { Box, Flex } from "theme-ui"

export const Afw = () => {
  return (
    <Flex
      sx={{
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Wind />
      <Box>Rwy</Box>
      <BaroClock />
      <Box>remark</Box>
    </Flex>
  )
}
