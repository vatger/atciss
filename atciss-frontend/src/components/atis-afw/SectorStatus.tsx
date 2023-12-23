import { Button, Grid, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import { selectStatusSectors } from "../../services/atisAfwSlice"
import {
  SectorStatus as SectorStatusType,
  StatusEnum,
  sectorstatusApi,
  selectSectorStatus,
  usePollSectorStatus,
} from "../../services/sectorstatusApi"

const StatusButton = ({
  sx,
  id,
  sectorStatus,
}: {
  sx?: ThemeUIStyleObject
  id: string
  sectorStatus: SectorStatusType
}) => {
  const [edit] = sectorstatusApi.useEditMutation()

  return (
    <Button
      onClick={() =>
        edit({
          id,
          status: { 0: "1", 1: "2", 2: "0", 3: "0" }[
            sectorStatus.status
          ] as StatusEnum,
        })
      }
      sx={{
        ...sx,
        backgroundColor: { 0: "green", 1: "orange", 2: "red", 3: "purple" }[
          sectorStatus?.status ?? 0
        ],
        p: 0,
        fontSize: 0,
        fontWeight: "bold",
        border: 2,
        borderRadius: 0,
        borderTopColor: "brightshadow",
        borderLeftColor: "brightshadow",
        borderBottomColor: "darkshadow",
        borderRightColor: "darkshadow",
        borderStyle: "solid",
        "&:active": {
          borderTopColor: "darkshadow",
          borderLeftColor: "darkshadow",
          borderBottomColor: "brightshadow",
          borderRightColor: "brightshadow",
        },
      }}
    >
      {id.replace(/^(.*\/)/, "")}
    </Button>
  )
}

export const SectorStatus = () => {
  const sectors = useAppSelector(selectStatusSectors)
  const { data: _s } = usePollSectorStatus(sectors.flat())
  const status = useAppSelector(selectSectorStatus)

  return (
    <Grid sx={{ gap: 1, gridAutoColumns: "1fr" }}>
      {sectors.map((row, idx) =>
        row.map((id) => (
          <StatusButton
            sx={{ gridRow: idx + 1 }}
            sectorStatus={status[id]}
            id={id}
            key={id}
          />
        )),
      )}
    </Grid>
  )
}
