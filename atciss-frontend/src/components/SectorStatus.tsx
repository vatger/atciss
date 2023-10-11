import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { sectorApi, selectSector } from "../services/sectorApi"
import { usePollControllers } from "../services/controllerApi"
import { selectOnlineOwner } from "../services/activePositionSlice"

const Sector = ({ id }: { id: string }) => {
  const sector = useAppSelector((store) => selectSector(store, id))
  const owner = useAppSelector((store) => selectOnlineOwner(store, id))

  return (
    <Box key={id}>
      <Text variant="label">{sector?.remark ?? sector?.id}</Text>
      {owner ? ` by ${owner.name} (${owner.frequency})` : " closed"}
    </Box>
  )
}

export const SectorStatus = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  usePollControllers()
  const activeEbg = useAppSelector(selectActiveEbg)
  const ebgSectors = EBG_SETTINGS[activeEbg].sectors

  sectorApi.useGetQuery()

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: 3,
        fontFamily: "monospace",
      }}
    >
      {ebgSectors.map((id) => (
        <Sector id={id} key={id} />
      ))}
    </Flex>
  )
}
