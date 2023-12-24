import { Box, Flex, Grid, Text, ThemeUIStyleObject } from "theme-ui"
import {
  usePollNotamByIcaoCodes,
  Notam as NotamType,
  selectActiveNotamsByDesignator,
  selectInactiveNotamsByDesignator,
  selectNotamIsRead,
  notamApi,
} from "../services/notamApi"
import { DateTime } from "luxon"
import { useAppSelector } from "../app/hooks"
import { selectNotamDesignators } from "../services/configSlice"

const Notam = ({ notam }: { notam: NotamType }) => {
  const valid_till = DateTime.fromISO(notam.valid_till).toUTC()
  const valid_from = DateTime.fromISO(notam.valid_from).toUTC()
  const active = DateTime.utc() >= valid_from
  const isRead = useAppSelector((store) =>
    selectNotamIsRead(store, notam.notam_id),
  )
  const [seen] = notamApi.useSeenMutation()
  const [unseen] = notamApi.useUnseenMutation()

  const click = () => {
    if (isRead) {
      unseen(notam.notam_id)
    } else {
      seen(notam.notam_id)
    }
  }

  // TODO:
  // show other locations for locations > 1?
  // est end time, not passed from API
  return (
    <>
      <Box
        sx={{ fontSize: 5, color: isRead ? "green" : "grey" }}
        onClick={click}
      >
        ✔️
      </Box>
      <Box
        onClick={click}
        sx={{
          padding: 2,
          fontFamily: "monospace",
          filter: isRead && "opacity(0.5)",
          cursor: "pointer",
          "&:hover": {
            filter: "opacity(1)",
          },
        }}
      >
        <Box
          title={`${valid_from.toFormat("y-MM-dd HH:mm")}-${
            valid_till.year !== 9999
              ? valid_till.toFormat("y-MM-dd HH:mm")
              : "permanent"
          }`}
        >
          <Text variant="label" sx={{ color: active ? "green" : "primary" }}>
            {active
              ? `Active, ${
                  valid_till.year !== 9999
                    ? `expires ${valid_till.toRelative()}`
                    : "permanent"
                }`
              : `Will be active ${valid_from.toRelative()}`}
          </Text>
        </Box>
        <Text variant="label">
          {notam.notam_id} NOTAM{notam.notam_type[0]} {notam.ref_notam_id}
        </Text>
        <Flex sx={{ gap: 5 }}>
          {notam.notam_code}
          <Box>
            <Text variant="label">FIR</Text> {notam.fir}
          </Box>
          <Box>
            <Text variant="label">Traffic</Text> {notam.traffic_type.join(", ")}
          </Box>
          <Box>
            <Text variant="label">Purpose</Text> {notam.purpose.join(", ")}
          </Box>
        </Flex>
        <Flex sx={{ gap: 5 }}>
          <Box>
            <Text variant="label">Scope</Text> {notam.scope.join(", ")}
          </Box>
          <Box>
            <Text variant="label">FL Lower</Text> {notam.fl_lower}
          </Box>
          <Box>
            <Text variant="label">FL Upper</Text> {notam.fl_upper}
          </Box>
          <Box>
            <Text variant="label">Area</Text> {notam.area.lat} {notam.area.long}{" "}
            {notam.area.radius}nm
          </Box>
        </Flex>
        {notam.schedule ? (
          <Box>
            <Text variant="label">Schedule</Text> {notam.schedule}
          </Box>
        ) : (
          <></>
        )}
        {notam.limit_lower ? (
          <Box>
            <Text variant="label">Lower Limit</Text> {notam.limit_lower}
          </Box>
        ) : (
          <></>
        )}
        {notam.limit_upper ? (
          <Box>
            <Text variant="label">Upper Limit</Text> {notam.limit_upper}
          </Box>
        ) : (
          <></>
        )}
        <Flex sx={{ gap: 5 }}>
          <Box>
            <Text variant="label">Created</Text>{" "}
            {notam.created
              ? DateTime.fromISO(notam.created)
                  .toUTC()
                  .toFormat("y-MM-dd HH:mm")
              : ""}
          </Box>
          <Box>
            <Text variant="label">Source</Text> {notam.source}
          </Box>
        </Flex>
        <Box sx={{ my: 1 }}>
          <pre>{notam.body}</pre>
        </Box>
      </Box>
    </>
  )
}

const NotamsByDesignator = ({ icao }: { icao: string }) => {
  const activeNotams = useAppSelector((store) =>
    selectActiveNotamsByDesignator(store, icao),
  )
  const inactiveNotams = useAppSelector((store) =>
    selectInactiveNotamsByDesignator(store, icao),
  )

  return (
    <Grid sx={{ gridTemplateColumns: "auto auto", alignItems: "center" }}>
      {activeNotams.map((n) => (
        <Notam notam={n} key={n.notam_id} />
      ))}
      {inactiveNotams.map((n) => (
        <Notam notam={n} key={n.notam_id} />
      ))}
    </Grid>
  )
}

const Notams = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const designators = useAppSelector(selectNotamDesignators)
  const { data: _n } = usePollNotamByIcaoCodes(designators)
  const { data: _ns } = notamApi.useGetSeenQuery()

  return (
    <Flex sx={{ ...sx, flexDirection: "column", padding: 2, gap: 2 }}>
      {designators.map((icao, idx) => {
        return (
          <details key={icao} open={idx === 0}>
            <summary>{icao}</summary>
            <NotamsByDesignator icao={icao} />
          </details>
        )
      })}
    </Flex>
  )
}

export { Notams }
