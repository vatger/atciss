import { BaroClock } from "components/idvs/BaroClock"
import { RunwayDisplay } from "components/idvs/RunwayDisplay"
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
        gap: 1,
      }}
    >
      <Wind />
      <RunwayDisplay />
      <BaroClock />
    </Flex>
  )
}
