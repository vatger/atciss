import { LayerGroup } from "react-leaflet"
import { NavaidMarker } from "./NavaidMarker"
import { navaidApi } from "../../services/navaidApi"
import { loaApi, selectLoaCops } from "../../services/loaApi"
import { useAppSelector } from "../../app/hooks"
import { selectOwnedSectors } from "../../services/activePositionSlice"

export const NavaidLayer = () => {
  const ownedSectors = useAppSelector(selectOwnedSectors)
  loaApi.useGetBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const cops = useAppSelector(selectLoaCops)
  navaidApi.useGetByDesignatorsQuery(cops)

  return (
    <LayerGroup>
      {cops.map((cop) => (
        <NavaidMarker key={cop} designator={cop} />
      ))}
    </LayerGroup>
  )
}
