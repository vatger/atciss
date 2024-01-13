import { useAppSelector } from "app/hooks"
import { Sector } from "components/atciss/map/SectorPolygon"
import { LayerGroup } from "react-leaflet"
import { usePollAtisByIcaoCodes } from "services/atisApi"
import { usePollControllers } from "services/controllerApi"
import {
  sectorApi,
  selectAirportICAOs,
  selectSectorIDs,
} from "services/sectorApi"

export const SectorLayer = () => {
  usePollControllers()

  sectorApi.useGetQuery()
  const sectors = useAppSelector(selectSectorIDs)

  const airports = useAppSelector(selectAirportICAOs)
  usePollAtisByIcaoCodes(airports)

  return (
    <LayerGroup>
      {sectors.map((id) => (
        <Sector key={id} id={id} />
      ))}
    </LayerGroup>
  )
}
