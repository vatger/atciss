import { Box, Text } from "theme-ui"
import { EBG_SETTINGS } from "../app/config"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { usePollEcfmpByFir } from "../services/ecfmpApi"
import { DateTime } from "luxon"

export const ECFMP = () => {
  const activeEbg = useAppSelector(selectActiveEbg)
  const { data: flowMeasures } = usePollEcfmpByFir(EBG_SETTINGS[activeEbg].fir)

  return flowMeasures?.map((fm) => {
    const start = DateTime.fromISO(fm.starttime).toUTC()
    const end = DateTime.fromISO(fm.endtime).toUTC()
    const active = DateTime.utc() >= start

    return (
      <Box mb={3} key={fm.ident}>
        <Box>
          <Text variant="label">{fm.ident}</Text>:{" "}
          <Text variant="label" sx={{ color: active ? "green" : "blue" }}>
            {active
              ? `Active, expires ${end.toRelative()}`
              : `Will be active ${start.toRelative()}`}
          </Text>{" "}
          (
          {`${start.toFormat("y-MM-dd HH:mm")}-${end.toFormat(
            "y-MM-dd HH:mm",
          )}`}
          )
        </Box>
        <pre style={{ whiteSpace: "pre-wrap" }}>{fm.reason}</pre>
        <Box>
          <Text variant="label">
            {fm.measure.type.replace("_", " ").toUpperCase()}
          </Text>
          {fm.measure.value && `: ${fm.measure.value}`}
        </Box>
        <Box>
          {fm.filters
            .map(
              (f) =>
                `${f.type.replace("_", " ").toUpperCase()}${
                  f.value &&
                  `: ${f.value instanceof Array ? f.value.join(", ") : f.value}`
                }`,
            )
            .join("; ")}
        </Box>
      </Box>
    )
  })
}
