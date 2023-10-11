import { LayerGroup } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { selectSectors } from "../../services/mapSlice"
import {
  sectorApi,
  selectAirportICAOs,
  selectSectorIDs,
} from "../../services/sectorApi"
import { usePollControllers } from "../../services/controllerApi"
import { Sector } from "./SectorPolygon"
import { usePollAtisByIcaoCodes } from "../../services/atisApi"

export const SectorLayer = () => {
  usePollControllers()

  sectorApi.useGetQuery()
  const sectors = useAppSelector(selectSectorIDs)

  const displaySectors = useAppSelector(selectSectors)

  const airports = useAppSelector(selectAirportICAOs)
  usePollAtisByIcaoCodes(airports)

  return (
    <LayerGroup>
      {displaySectors && sectors.map((id) => <Sector key={id} id={id} />)}
    </LayerGroup>
  )
}
