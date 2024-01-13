import { useAppSelector } from "app/hooks"
import { selectOnlineOwner } from "services/activePositions"
import { api } from "services/api"
import { selectStaffingSectors } from "services/atisAfwSlice"
import { usePollControllers } from "services/controllerApi"
import { selectSector } from "services/sectorApi"
import { Box, Flex, Text } from "theme-ui"

const Sector = ({ id }: { id: string }) => {
  const sector = useAppSelector((store) => selectSector(store, id))
  const owner = useAppSelector((store) => selectOnlineOwner(store, id))

  return (
    <Box key={id}>
      <Text variant="primaryLabel">{sector?.remark ?? sector?.id}</Text>
      {owner
        ? id === owner.id
          ? ` open (${owner.frequency})`
          : ` by ${owner.name}`
        : " closed"}
    </Box>
  )
}

export const SectorStaffing = () => {
  usePollControllers()
  const sectors = useAppSelector(selectStaffingSectors)

  api.useSectorsQuery()

  return (
    <Flex
      sx={{
        flexDirection: "column",
        fontSize: 1,
        fontFamily: "monospace",
      }}
    >
      {sectors.map((id) => (
        <Sector id={id} key={id} />
      ))}
    </Flex>
  )
}
