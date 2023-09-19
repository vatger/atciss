import { Box, Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { SectorControls } from "../components/SectorControls"
import { useAppSelector } from "../app/hooks"
import {
  selectOwnerToSector,
  selectSelectedPosition,
} from "../services/activePositionSlice"
import { LoaItem, loaApi } from "../services/loaApi"
import { LoaRow } from "../components/LoaRow"

export const LOA = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const ownerToSector = useAppSelector(selectOwnerToSector)
  const selectedPosition = useAppSelector(selectSelectedPosition)
  const ownedSectors =
    (selectedPosition ? ownerToSector[selectedPosition] : null) ?? []
  const relevantLoas = loaApi.useGetBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })

  const sortBy = (attrs: (keyof LoaItem)[]) => (a: LoaItem, b: LoaItem) => {
    for (const attr of attrs) {
      if (a[attr] === null) continue
      const comp =
        typeof a[attr] === "string"
          ? (a[attr] as string).localeCompare(b[attr] as string)
          : a[attr] - b[attr]
      if (comp !== 0) return comp
    }

    return 0
  }

  const xLoas = relevantLoas.data
    ?.filter(
      (loa) =>
        ownedSectors.includes(loa.from_sector) &&
        !ownedSectors.includes(loa.to_sector),
    )
    ?.sort(sortBy(["from_sector", "to_sector", "cop"]))
  const nLoas = relevantLoas.data
    ?.filter(
      (loa) =>
        ownedSectors.includes(loa.to_sector) &&
        !ownedSectors.includes(loa.from_sector),
    )
    ?.sort(sortBy(["to_sector", "from_sector", "cop"]))

  return (
    <Grid
      sx={{
        ...sx,
        gap: "1rem",
        gridTemplateColumns: "4fr 1fr",
        width: "100%",
      }}
    >
      <Box>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>COPX</th>
              <th>ADEP/ADES</th>
              <th>FL</th>
              <th>REMARK</th>
              <th>FROM</th>
              <th>TO</th>
            </tr>
          </thead>
          <tbody>
            {xLoas?.map((loa) => (
              <LoaRow
                key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}`}
                loa={loa}
              />
            ))}
          </tbody>
        </table>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>COPN</th>
              <th>ADEP/ADES</th>
              <th>FL</th>
              <th>REMARK</th>
              <th>FROM</th>
              <th>TO</th>
            </tr>
          </thead>
          <tbody>
            {nLoas?.map((loa) => (
              <LoaRow
                key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}`}
                loa={loa}
              />
            ))}
          </tbody>
        </table>
      </Box>
      <Flex sx={{ flexDirection: "column", gap: 3, overflow: "hidden" }}>
        <SectorControls />
      </Flex>
    </Grid>
  )
}
