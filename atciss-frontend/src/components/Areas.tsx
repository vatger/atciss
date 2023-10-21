import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { EBG_SETTINGS } from "../app/config"
import { selectActiveEbg } from "../services/configSlice"
import { useAppSelector } from "../app/hooks"
import { AreaBooking, selectArea, usePollAreas } from "../services/areaApi"
import { z3 } from "../app/utils"
import { DateTime, Duration } from "luxon"

const areaString = (area: AreaBooking | undefined) => {
  if (area) {
    const start = DateTime.fromISO(area.start_datetime).toUTC()
    const end = DateTime.fromISO(area.end_datetime).toUTC()
    const active = DateTime.utc() >= start && DateTime.utc() < end
    const soonActive =
      DateTime.fromISO(area.start_datetime).toUTC() <=
      DateTime.utc().plus(Duration.fromObject({ minutes: 30 }))

    if (active || soonActive) {
      return (
        <Text color={active ? "primary" : "red"}>
          FL{z3(area.lower_limit)}-FL{z3(area.upper_limit)}{" "}
          {start.toFormat("HHmm")}z-{end.toFormat("HHmm")}z
        </Text>
      )
    }
  }

  return "not active"
}

const Area = ({ name }: { name: string }) => {
  const area = useAppSelector((store) => selectArea(store, name))

  return (
    <Box>
      <Text variant="label">{name}</Text>: {areaString(area)}
    </Box>
  )
}

export const Areas = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const activeEbg = useAppSelector(selectActiveEbg)
  const areaNames: string[] = EBG_SETTINGS[activeEbg].areas
  usePollAreas()

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: 3,
        fontFamily: "monospace",
      }}
    >
      {areaNames.map((area) => (
        <Area key={area} name={area} />
      ))}
    </Flex>
  )
}
