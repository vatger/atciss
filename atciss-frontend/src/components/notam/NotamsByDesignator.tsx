import { Grid } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import {
  selectActiveNotamsByDesignator,
  selectInactiveNotamsByDesignator,
} from "../../services/notamApi"
import { Notam } from "./Notam"

export const NotamsByDesignator = ({ icao }: { icao: string }) => {
  const activeNotams = useAppSelector((store) =>
    selectActiveNotamsByDesignator(store, icao),
  )
  const inactiveNotams = useAppSelector((store) =>
    selectInactiveNotamsByDesignator(store, icao),
  )

  return (
    <Grid sx={{ gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
      {activeNotams.map((n) => (
        <Notam notam={n} key={n.notam_id} />
      ))}
      {inactiveNotams.map((n) => (
        <Notam notam={n} key={n.notam_id} />
      ))}
    </Grid>
  )
}
