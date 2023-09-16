import { LayerGroup } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import {
  selectActivePositions,
  selectSyncedToOnline,
} from "../../services/activePositionSlice"
import { selectLevel, selectSectors } from "../../services/mapSlice"
import { Sector, sectorApi } from "../../services/airspaceApi"
import { usePollControllers } from "../../services/controllerApi"
import { SectorPolygon } from "./SectorPolygon"

export const SectorLayer = () => {
  const { data } = sectorApi.useGetByRegionQuery("germany")
  usePollControllers()

  const activePositions = useAppSelector(selectActivePositions)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)

  const level = useAppSelector(selectLevel)
  const displaySectors = useAppSelector(selectSectors)
  const levelFilter = (s: Sector) =>
    (s.min ?? 0) <= level && level < (s.max ?? 999)

  const sectors = data?.airspace
    .filter((a) => a.sectors.some(levelFilter))
    .map(({ id: name, owner, sectors }) => ({
      name,
      owner,
      sectors: sectors.filter(levelFilter),
    }))

  return (
    <LayerGroup>
      {displaySectors &&
        sectors?.map(({ name, sectors, owner }) => {
          const controllingSector = owner.find((pos) =>
            syncedToOnline
              ? activePositions[pos]?.online
              : activePositions[pos]?.manual,
          )

          return controllingSector
            ? sectors.map((sector, index) => (
                <SectorPolygon
                  key={index}
                  sector={sector}
                  name={name}
                  controllingSector={controllingSector}
                />
              ))
            : []
        })}
    </LayerGroup>
  )
}
