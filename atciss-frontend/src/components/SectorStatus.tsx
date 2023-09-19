import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { selectActivePositions } from "../services/activePositionSlice"
import { sectorApi } from "../services/airspaceApi"
import { usePollControllers } from "../services/controllerApi"

export const SectorStatus = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  usePollControllers()
  const activeEbg = useAppSelector(selectActiveEbg)
  const ebgSectors: string[] = EBG_SETTINGS[activeEbg].sectors
  const activePositions = useAppSelector(selectActivePositions)
  const { data: sectors } = sectorApi.useGetByRegionQuery("germany")

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: 3,
        fontFamily: "monospace",
      }}
    >
      {ebgSectors.map((sectorName) => {
        const controllingSector = sectors?.airspace
          .find(
            (sector) => sector.id == sectorName || sector.remark == sectorName,
          )
          ?.owner.find((owner) => activePositions[owner]?.online)
        return (
          <Box key={sectorName}>
            <Text variant="label">{sectorName}</Text>
            {controllingSector
              ? ` by ${controllingSector} (${sectors?.positions[controllingSector].frequency})`
              : " closed"}
          </Box>
        )
      })}
    </Flex>
  )
}
