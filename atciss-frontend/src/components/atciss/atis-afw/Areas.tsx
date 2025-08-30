import { useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { DateTime, Duration } from "luxon"
import { useState } from "react"
import { selectArea, usePollAreas } from "services/areaApi"
import { selectAtisAreas } from "services/atisAfwSlice"
import { Box, Flex, Text, Link, ThemeUIStyleObject } from "theme-ui"
import { AreaBooking } from "types/area"

const Area = ({ name }: { name: string }) => {
  const areas = useAppSelector((store) => selectArea(store, name))

  return areas.map((area, index) => <AreaItem key={index} area={area} />)
}

const AreaItem = ({ area }: { area: AreaBooking }) => {
  const start = DateTime.fromISO(area.start).toUTC()
  const end = DateTime.fromISO(area.end).toUTC()
  const active = DateTime.utc() >= start && DateTime.utc() < end
  const soonActive =
    DateTime.fromISO(area.start).toUTC() <=
    DateTime.utc().plus(Duration.fromObject({ minutes: 60 }))

  if (active || soonActive) {
    if (area.source === "dfs_aup") {
      return (
        <Box>
          <Text variant="label">{area.name}</Text>:
          <Text color={active ? "text" : "red"}>
            FL{z3(area.lower_limit)}-FL{z3(area.upper_limit)}{" "}
            {start.toFormat("HHmm")}z-{end.toFormat("HHmm")}z
          </Text>
        </Box>
      )
    } else if (area.source === "vlara") {
      if (area.status === "cancelled") {
        return <></>
      }

      const [open, setOpen] = useState(false)

      return (
        <Box sx={{ cursor: "pointer" }} onClick={() => setOpen(!open)}>
          <Text variant="label">{area.name}</Text>:
          <Text
            color={
              active && area.status === "active"
                ? "text"
                : area.status === "pending"
                  ? "red"
                  : "text"
            }
          >
            FL{z3(area.lower_limit)}-FL{z3(area.upper_limit)} {area.status}{" "}
            {start.toFormat("HHmm")}z-{end.toFormat("HHmm")}z ({area.nbr_acft}{" "}
            ACFT, {area.agency})
          </Text>
          <Text sx={{ marginLeft: 1 }}>{open ? "⏷" : "⏵"}</Text>
          <Box sx={{ display: open ? "block" : "none", marginLeft: 3 }}>
            Activity: <strong>{area.activity_type}</strong>
            <br />
            POC:{" "}
            <strong>
              <Link
                href={`https://stats.vatsim.net/stats/${area.creator}`}
                target="_blank"
                rel="noreferrer"
              >
                {area.creator}
              </Link>
            </strong>
            <br />
            Remark: <strong>{area.remarks}</strong>
            <br />
            Callsigns:{" "}
            <strong>{area.callsigns && area.callsigns.join(", ")}</strong>
          </Box>
        </Box>
      )
    }
  }

  return <></>
}

export const Areas = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const areaGroups = useAppSelector(selectAtisAreas)
  usePollAreas()

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
