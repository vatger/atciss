import { useAppSelector } from "app/hooks"
import { api } from "services/api"
import { usePollAtisByIcaoCodes } from "services/atisApi"
import { selectActiveAerodrome } from "services/idvsSlice"
import { selectMetar, usePollMetarByIcaoCodes, xmc } from "services/metarApi"
import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"

interface RVRValueProps {
  point: string
  value?: number
  trend?: string | null
}

interface ANBLFBitProps {
  text: string
  state?: string
}

const RVRValue = ({ point, value, trend }: RVRValueProps) => {
  return (
    <Box sx={{ width: "6rem" }}>
      {point}
      <br />
      <Text sx={{ fontSize: "1.9rem" }}>
        {value || "\u00A0"}
        {trend && value && (trend == "D" ? "↓" : trend == "U" ? "↑" : "")}
      </Text>
    </Box>
  )
}

const ANBLFBit = ({ text, state }: ANBLFBitProps) => {
  return (
    <Box sx={{ marginRight: "1rem" }}>
      <Text
        sx={{
          fontSize: "1.9rem",
          backgroundColor:
            state == "bad"
              ? "#ed5252"
              : state == "good"
                ? "#7bd67d"
                : "inherit",
        }}
      >
        {text}
      </Text>
    </Box>
  )
}

const rotationMap: Record<string, string> = {
  left: "180",
  right: "0",
  up: "90",
  down: "270",
}

const RWYArrow = ({ dir }: { dir: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 37.31 21.94"
      style={{
        fill: "#fff",
        height: dir == "left" || dir == "right" ? "100%" : "auto",
        width: dir == "up" || dir == "down" ? "100%" : "auto",
        transform: "rotate(" + rotationMap[dir] + "deg)",
      }}
    >
      <polygon points="0 16.47 18.31 16.47 18.31 21.94 37.31 10.97 18.31 0 18.31 5.47 0 5.47 0 16.47" />
    </svg>
  )
}

const ApproachStatus = ({ cat, suffix }: { cat: number; suffix?: string }) => {
  return (
    <Flex
      sx={{
        height: "2.5rem",
        gap: 3,
        mx: 6,
        fontSize: "2rem",
        color: "black",
        width: "20rem",
      }}
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

export const HorizontalRunwayStrip = ({
  rwy1,
  rwy2,
  rvrs,
  sx,
}: {
  rwy1: string
  rwy2: string
  rvrs: string[]
  sx?: ThemeUIStyleObject
}) => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  const metar = useAppSelector((store) =>
    selectMetar(store, aerodrome),
  )?.current

  const { data: atisData } = usePollAtisByIcaoCodes([aerodrome])
  const atis = atisData?.[aerodrome]

  let mc = "?"
  if (metar) {
    mc = xmc(metar)
  }

  const leftActive = atis?.runways_in_use.includes(rwy1)
  const rightActive = atis?.runways_in_use.includes(rwy2)

  const myRvr = metar?.rvr?.find(
    (rvr) => rvr.runway == rwy1 || rvr.runway == rwy2,
  )

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
          {rvrs.map((rvr) => (
            <RVRValue
              key={rvr}
              point={rvr}
              value={myRvr?.low}
              trend={myRvr?.trend}
            />
          ))}
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
          justifyContent: rightActive ? "flex-end" : "flex-start",
        }}
      >
        {leftActive && (
          <>
            <RWYArrow dir={"right"} />
            &nbsp;{rwy1}
          </>
        )}
        {(leftActive || rightActive) && (
          <ApproachStatus cat={mc == "LVP" ? 3 : 1} />
        )}
        {rightActive && (
          <>
            {rwy2}&nbsp;
            <RWYArrow dir={"left"} />
          </>
        )}
      </Flex>
      <Flex sx={{}}>
        <Text sx={{ width: "4rem" }}>RCC:</Text>
        <Flex sx={{ flexGrow: 9, justifyContent: "space-between" }}></Flex>
      </Flex>
      <Box sx={{ marginTop: "1rem", paddingLeft: "4rem" }}>
        <Text>ANBLF</Text>
        <Flex>
          <ANBLFBit text="LGT" />
          <ANBLFBit text="DME" />
        </Flex>
      </Box>
    </Flex>
  )
}
