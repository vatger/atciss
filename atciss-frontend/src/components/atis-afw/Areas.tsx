import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import { selectArea, usePollAreas } from "../../services/areaApi"
import { z3 } from "../../app/utils"
import { DateTime, Duration } from "luxon"
import { selectAtisAreas } from "../../services/atisAfwSlice"

const Area = ({ name }: { name: string }) => {
  const area = useAppSelector((store) => selectArea(store, name))

  if (area) {
    const start = DateTime.fromISO(area.start_datetime).toUTC()
    const end = DateTime.fromISO(area.end_datetime).toUTC()
    const active = DateTime.utc() >= start && DateTime.utc() < end
    const soonActive =
      DateTime.fromISO(area.start_datetime).toUTC() <=
      DateTime.utc().plus(Duration.fromObject({ minutes: 30 }))

    if (active || soonActive) {
      return (
        <Box>
          <Text variant="label">{name}</Text>:
          <Text color={active ? "text" : "red"}>
            FL{z3(area.lower_limit)}-FL{z3(area.upper_limit)}{" "}
            {start.toFormat("HHmm")}z-{end.toFormat("HHmm")}z
          </Text>
        </Box>
      )
    }
  }

  return <></>
}

export const Areas = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const areaGroups = useAppSelector(selectAtisAreas)
  const { data: _a } = usePollAreas()

  return (
    <Flex
      sx={{
        ...sx,
        padding: 0,
        flexDirection: "column",
        fontSize: 1,
        fontFamily: "monospace",
        gap: "2px",
        backgroundColor: "primary",
      }}
    >
      {Object.entries(areaGroups).map(([group, areas]) => (
        <Box key={group} sx={{ backgroundColor: "background" }}>
          <Text variant="primaryLabel">{group}</Text>
          {areas.map((area) => (
            <Area key={area} name={area} />
          ))}
        </Box>
      ))}
      <Box sx={{ height: "100%", backgroundColor: "background" }}></Box>
    </Flex>
  )
}
