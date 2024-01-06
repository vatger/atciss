import { useAppSelector } from "app/hooks"
import { selectOnlineOwner } from "services/activePositionSlice"
import { selectStaffingSectors } from "services/atisAfwSlice"
import { usePollControllers } from "services/controllerApi"
import { sectorApi, selectSector } from "services/sectorApi"
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
  const { data: _c } = usePollControllers()
  const sectors = useAppSelector(selectStaffingSectors)

  const { data: _s } = sectorApi.useGetQuery()

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
