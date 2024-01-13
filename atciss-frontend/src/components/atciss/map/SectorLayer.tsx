import { useAppSelector } from "app/hooks"
import { Sector } from "components/atciss/map/SectorPolygon"
import { LayerGroup } from "react-leaflet"
import { selectAirportICAOs } from "services/aerodrome"
import { api } from "services/api"
import { usePollAtisByIcaoCodes } from "services/atisApi"
import { usePollControllers } from "services/controllerApi"
import { selectSectorIDs } from "services/sectorApi"

export const SectorLayer = () => {
  usePollControllers()

  api.useSectorsQuery()
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
