import { useAppSelector } from "app/hooks"
import { LoaNavaidMarker } from "components/atciss/map/LoaNavaidMarker"
import { NavaidMarker } from "components/atciss/map/NavaidMarker"
import { LayerGroup } from "react-leaflet"
import { selectOwnedSectors } from "services/activePositionSlice"
import { loaApi, selectLoaCops } from "services/loaApi"
import { selectLoaOnMap, selectSelectedAirway } from "services/mapSlice"
import {
  navaidApi,
  selectAirwayNavaids,
  selectSearchedNavaids,
} from "services/navaidApi"

export const NavaidLayer = () => {
  const loaOnMap = useAppSelector(selectLoaOnMap)
  const ownedSectors = useAppSelector(selectOwnedSectors)
  loaApi.useGetBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const cops = useAppSelector(selectLoaCops)
  navaidApi.useGetByDesignatorsQuery(cops)
  const foundNavaids = useAppSelector(selectSearchedNavaids)

  const airway = useAppSelector(selectSelectedAirway)
  navaidApi.useGetByAirwayQuery(airway, {
    skip: airway === null,
  })
  const airwayNavaids = useAppSelector(selectAirwayNavaids)

  return (
    <LayerGroup>
      {loaOnMap &&
        cops.map((cop) => <LoaNavaidMarker key={cop} designator={cop} />)}
      {foundNavaids.map((navaid) => (
        <NavaidMarker navaid={navaid} key={navaid.id} />
      ))}
      {airwayNavaids.map((navaid) => (
        <NavaidMarker navaid={navaid} key={navaid.id} />
      ))}
    </LayerGroup>
  )
}
