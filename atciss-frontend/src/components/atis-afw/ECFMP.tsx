/** @jsxImportSource theme-ui */

import { Box, Text } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import { selectEcfmpMeasures, usePollEcfmpByFir } from "../../services/ecfmpApi"
import { DateTime, Duration } from "luxon"
import { ReactNode } from "react"
import { selectActiveFir } from "../../services/configSlice"

export const ECFMP = () => {
  const activeFir = useAppSelector(selectActiveFir)
  const { data: _f } = usePollEcfmpByFir(activeFir)
  const flowMeasures = useAppSelector(selectEcfmpMeasures)

  return flowMeasures
    ?.filter(
      (fm) =>
        DateTime.fromISO(fm.endtime).toUTC() >= DateTime.utc() &&
        !fm.withdrawn_at,
    )
    .map((fm) => {
      const start = DateTime.fromISO(fm.starttime).toUTC()
      const end = DateTime.fromISO(fm.endtime).toUTC()
      const active = DateTime.utc() >= start

      return (
        <Box mb={3} key={fm.ident}>
          <Box>
            <Text variant="label">{fm.ident}</Text>:{" "}
            <Text variant="label" sx={{ color: active ? "green" : "primary" }}>
              {active
                ? `Active, expires ${end.setLocale("en").toRelative()}`
                : `Will be active ${start.setLocale("en").toRelative()}`}
            </Text>{" "}
            (
            {`${start.toFormat("y-MM-dd HH:mm")}-${end.toFormat(
              "y-MM-dd HH:mm",
            )}`}
            )
          </Box>
          <pre sx={{ whiteSpace: "pre-wrap" }}>{fm.reason}</pre>
          <Box>
            <Text variant="label">
              {fm.measure.type.replaceAll("_", " ").toUpperCase()}
            </Text>
            {fm.measure.value &&
              `: ${
                [
                  "minimum_departure_interval",
                  "average_departure_interval",
                ].includes(fm.measure.type)
                  ? Duration.fromObject({
                      seconds: fm.measure.value as number,
                    })
                      .rescale()
                      .toHuman({
                        unitDisplay: "short",
                      })
                  : fm.measure.value
              }`}
          </Box>
          <Box>
            {fm.filters
              .map<ReactNode>((f) => (
                <>
                  {f.type.replaceAll("_", " ").toUpperCase()}
                  {f.value && (
                    <>
                      :{" "}
                      <Text variant="label">
                        {typeof f.value === "number"
                          ? f.value
                          : f.value instanceof Array
                            ? f.value.join(", ")
                            : f.value.event_id}
                      </Text>
                    </>
                  )}
                </>
              ))
              .reduce((prev, curr) => [prev, "; ", curr])}
          </Box>
        </Box>
      )
    })
}
