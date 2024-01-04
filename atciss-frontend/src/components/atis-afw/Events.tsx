/** @jsxImportSource theme-ui */

import { Box, Text } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import {
  selectActiveFir,
  selectNeighbourFirs,
} from "../../services/configSlice"
import { DateTime, Duration } from "luxon"
import { usePollEventsByFirs } from "../../services/eventApi"

export const Events = () => {
  const activeFir = useAppSelector(selectActiveFir)
  const neighbourFirs = useAppSelector(selectNeighbourFirs)
  const { data: events } = usePollEventsByFirs([...neighbourFirs, activeFir])

  return events
    ?.filter(
      (e) =>
        DateTime.fromISO(e.date_end).toUTC() >= DateTime.utc() &&
        DateTime.fromISO(e.date_start).toUTC() <=
          DateTime.utc().plus(Duration.fromObject({ days: 7 })),
    )
    .map((e) => {
      const start = DateTime.fromISO(e.date_start).toUTC()
      const end = DateTime.fromISO(e.date_end).toUTC()
      const active = DateTime.utc() >= start

      return (
        <Box mb={3} key={e.name}>
          <Box>
            <Text variant="label">{e.fir}</Text>:{" "}
            <Text variant="label" sx={{ color: active ? "green" : "primary" }}>
              {active
                ? `Active, ends ${end.setLocale("en").toRelative()}`
                : `Will start ${start.setLocale("en").toRelative()}`}
            </Text>{" "}
            (
            {`${start.toFormat("y-MM-dd HH:mm")}-${end.toFormat(
              "y-MM-dd HH:mm",
            )}`}
            )
          </Box>
          <pre sx={{ whiteSpace: "pre-wrap" }}>{e.name}</pre>
        </Box>
      )
    })
}
