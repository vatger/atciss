import { LayerGroup } from "react-leaflet"
import { navaidApi, selectSearchedNavaids } from "../../services/navaidApi"
import { loaApi, selectLoaCops } from "../../services/loaApi"
import { useAppSelector } from "../../app/hooks"
import { selectOwnedSectors } from "../../services/activePositionSlice"
import { LoaNavaidMarker } from "./LoaNavaidMarker"
import { NavaidMarker } from "./NavaidMarker"
import { selectLoaOnMap } from "../../services/mapSlice"

export const NavaidLayer = () => {
  const loaOnMap = useAppSelector(selectLoaOnMap)
  const ownedSectors = useAppSelector(selectOwnedSectors)
  const { data: _l } = loaApi.useGetBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const cops = useAppSelector(selectLoaCops)
  const { data: _n } = navaidApi.useGetByDesignatorsQuery(cops)
  const foundNavaids = useAppSelector(selectSearchedNavaids)

  return (
    <LayerGroup>
      {loaOnMap &&
        cops.map((cop) => <LoaNavaidMarker key={cop} designator={cop} />)}
      {foundNavaids.map((navaid) => (
        <NavaidMarker navaid={navaid} key={navaid.id} />
      ))}
      )
    </LayerGroup>
  )
}
