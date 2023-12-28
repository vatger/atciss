import { Flex, Grid, Text } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import {
  selectActiveNotamsByDesignator,
  selectInactiveNotamsByDesignator,
  selectTotalNotamsByDesignator,
} from "../../services/notamApi"
import { Notam } from "./Notam"

export const NotamsByDesignator = ({ icao }: { icao: string }) => {
  const activeNotams = useAppSelector((store) =>
    selectActiveNotamsByDesignator(store, icao),
  )
  const inactiveNotams = useAppSelector((store) =>
    selectInactiveNotamsByDesignator(store, icao),
  )
  const items = useAppSelector((store) =>
    selectTotalNotamsByDesignator(store, icao),
  )
  const filteredItems = activeNotams.length + inactiveNotams.length

  return (
    <>
      <summary>
        <Flex sx={{ display: "inline-flex", gap: 2, alignItems: "baseline" }}>
          <Text>{icao}</Text>
          <Text sx={{ fontSize: 0 }}>
            ({filteredItems != items && `${filteredItems}/`}
            {items})
          </Text>
        </Flex>{" "}
      </summary>
      <Grid sx={{ gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
        {activeNotams.map((n) => (
          <Notam notam={n} key={n.notam_id} />
        ))}
        {inactiveNotams.map((n) => (
          <Notam notam={n} key={n.notam_id} />
        ))}
      </Grid>
    </>
  )
}
