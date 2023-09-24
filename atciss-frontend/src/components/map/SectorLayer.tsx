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
import { usePollAtisByIcaoCodes } from "../../services/atisApi"

export const SectorLayer = () => {
  const { data } = sectorApi.useGetByRegionQuery()
  usePollControllers()

  const activePositions = useAppSelector(selectActivePositions)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)

  const level = useAppSelector(selectLevel)
  const displaySectors = useAppSelector(selectSectors)

  const { data: atis } = usePollAtisByIcaoCodes(
    Object.keys(data?.airports ?? {}),
  )

  const levelFilter = (s: Sector) =>
    (s.min ?? 0) <= level && level < (s.max ?? 999)
  const rwyFilter = (s: Sector) =>
    s.runways.length === 0 ||
    s.runways.some((rwy) => {
      const rwysInUse = atis?.[rwy.icao]?.runways_in_use ?? []
      const rwyPriority = data?.airports?.[rwy.icao].runways ?? []
      return rwysInUse.length > 0
        ? rwysInUse.some((activeRwy) => activeRwy.startsWith(rwy.runway))
        : rwyPriority[0] === rwy.runway
    })

  const sectors = data?.airspace
    .filter((a) => a.sectors.some(levelFilter))
    .map(({ id: name, remark, owner, sectors }) => ({
      name,
      remark,
      owner,
      sectors: sectors.filter(levelFilter).filter(rwyFilter),
    }))

  return (
    <LayerGroup>
      {displaySectors &&
        sectors?.map(({ name, remark, sectors, owner }) => {
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
                  remark={remark}
                  controllingSector={controllingSector}
                />
              ))
            : []
        })}
    </LayerGroup>
  )
}
