import { LayerGroup } from "react-leaflet"
import {
  navaidApi,
  selectAirwayNavaids,
  selectSearchedNavaids,
} from "../../services/navaidApi"
import { loaApi, selectLoaCops } from "../../services/loaApi"
import { useAppSelector } from "../../app/hooks"
import { selectOwnedSectors } from "../../services/activePositionSlice"
import { LoaNavaidMarker } from "./LoaNavaidMarker"
import { NavaidMarker } from "./NavaidMarker"
import { selectLoaOnMap, selectSelectedAirway } from "../../services/mapSlice"

export const NavaidLayer = () => {
  const loaOnMap = useAppSelector(selectLoaOnMap)
  const ownedSectors = useAppSelector(selectOwnedSectors)
  const { data: _l } = loaApi.useGetBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const cops = useAppSelector(selectLoaCops)
  const { data: _n } = navaidApi.useGetByDesignatorsQuery(cops)
  const foundNavaids = useAppSelector(selectSearchedNavaids)

  const airway = useAppSelector(selectSelectedAirway)
  const { data: _a } = navaidApi.useGetByAirwayQuery(airway, {
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
