import { useAppSelector } from "app/hooks"
import { api } from "services/api"
import { selectActiveAerodrome } from "services/idvsSlice"
import { usePollMetarByIcaoCodes } from "services/metarApi"
import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"

interface RVRValueProps {
  point: string
  value: number
  prevValue?: number
}

const RVRValue = ({ point, value, prevValue }: RVRValueProps) => {
  return (
    <Box sx={{ width: "6rem" }}>
      {point}
      <br />
      <Text sx={{ fontSize: "1.9rem" }}>
        {value} {prevValue && (prevValue > value ? "↓" : "↑")}
      </Text>
    </Box>
  )
}

const ApproachStatus = ({ cat, suffix }: { cat: number; suffix?: string }) => {
  return (
    <Flex
      sx={{ height: "2.5rem", gap: 3, mx: 6, fontSize: "2rem", color: "black" }}
    >
      {cat === 0 && (
        <>
          <Box sx={{ backgroundColor: "#ed5252", width: "4rem" }}>&nbsp;</Box>
          <Box sx={{ backgroundColor: "#ed5252", width: "4rem" }}>&nbsp;</Box>
          <Box sx={{ backgroundColor: "#ed5252", width: "4rem" }}>&nbsp;</Box>
        </>
      )}
      {cat === 1 && (
        <>
          <Box
            sx={{
              backgroundColor: "#7bd67d",
              width: "4rem",
              textAlign: "center",
            }}
          >
            I{suffix}
          </Box>
        </>
      )}
      {cat === 2 && (
        <>
          <Box sx={{ backgroundColor: "#7bd67d", width: "4rem" }}>&nbsp;</Box>
          <Box
            sx={{
              backgroundColor: "#7bd67d",
              width: "4rem",
              textAlign: "center",
            }}
          >
            II{suffix}
          </Box>
        </>
      )}
      {cat === 3 && (
        <>
          <Box sx={{ backgroundColor: "#7bd67d", width: "4rem" }}>&nbsp;</Box>
          <Box sx={{ backgroundColor: "#7bd67d", width: "4rem" }}>&nbsp;</Box>
          <Box
            sx={{
              backgroundColor: "#7bd67d",
              width: "4rem",
              textAlign: "center",
            }}
          >
            III{suffix}
          </Box>
        </>
      )}
    </Flex>
  )
}

export const HorizontalRunwayStrip = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: "1.3rem",
      }}
    >
      <Flex>
        <Text sx={{ width: "4rem" }}>RVR:</Text>
        <Flex sx={{ flexGrow: 9, justifyContent: "space-between" }}>
          <RVRValue point="D" value={450} prevValue={500} />
          <RVRValue point="C" value={450} prevValue={300} />
          <RVRValue point="B" value={450} />
          <RVRValue point="A" value={450} />
        </Flex>
      </Flex>
      <Flex
        sx={{
          backgroundColor: "#6c6c6c",
          height: "3.5rem",
          marginLeft: "4rem",
          color: "white",
          fontSize: "3rem",
          p: 1,
          alignItems: "center",
        }}
      >
        ⮕ &nbsp;08L
        <ApproachStatus cat={0} />
        <ApproachStatus cat={1} />
        <ApproachStatus cat={2} />
        <ApproachStatus cat={3} suffix="b" />
      </Flex>
      <Flex sx={{}}>
        <Text sx={{ width: "4rem" }}>BA:</Text>
        <Flex sx={{ flexGrow: 9, justifyContent: "space-between" }}></Flex>
      </Flex>
    </Flex>
  )
}
