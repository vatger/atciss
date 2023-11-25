import { LayerGroup } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import {
  sectorApi,
  selectAirportICAOs,
  selectSectorIDs,
} from "../../services/sectorApi"
import { usePollControllers } from "../../services/controllerApi"
import { Sector } from "./SectorPolygon"
import { usePollAtisByIcaoCodes } from "../../services/atisApi"

export const SectorLayer = () => {
  const { data: _c } = usePollControllers()

  const { data: _s } = sectorApi.useGetQuery()
  const sectors = useAppSelector(selectSectorIDs)

  const airports = useAppSelector(selectAirportICAOs)
  const { data: _a } = usePollAtisByIcaoCodes(airports)

  return (
    <LayerGroup>
      {sectors.map((id) => (
        <Sector key={id} id={id} />
      ))}
    </LayerGroup>
  )
}
