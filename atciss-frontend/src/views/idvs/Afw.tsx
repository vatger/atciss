import { BaroClock } from "components/idvs/BaroClock"
import { Runways } from "components/idvs/Runways"
import { Wind } from "components/idvs/Wind"
import { Flex } from "theme-ui"

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
      <Runways />
      <BaroClock />
      {/*<Box>remark</Box> */}
    </Flex>
  )
}
