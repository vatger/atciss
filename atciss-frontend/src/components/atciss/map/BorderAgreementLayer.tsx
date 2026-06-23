import { useAppSelector } from "app/hooks"
import { BorderAgreementArea } from "components/atciss/map/BorderAgreementArea"
import { BorderAgreementLine } from "components/atciss/map/BorderAgreementLine"
import { LayerGroup } from "react-leaflet"
import { selectOwnedSectors } from "services/activePositions"
import { api } from "services/api"
import {
  selectLateralBorderSegments,
  selectVerticalBorderGroups,
} from "services/loaMapSelectors"

export const BorderAgreementLayer = () => {
  const ownedSectors = useAppSelector(selectOwnedSectors)
  api.useLoaBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const lateralBorderAgreements = useAppSelector(selectLateralBorderSegments)
  const verticalBorderAgreements = useAppSelector(selectVerticalBorderGroups)

  return (
    <LayerGroup>
      {lateralBorderAgreements.map(
        ({ key, segment, exitAgreements, entryAgreements }) => (
          <BorderAgreementLine
            key={key}
            segment={segment}
            exitAgreements={exitAgreements}
            entryAgreements={entryAgreements}
          />
        ),
      )}
      {verticalBorderAgreements.map((group) => (
        <BorderAgreementArea
          key={group.key}
          exitAgreements={group.exitAgreements}
          entryAgreements={group.entryAgreements}
          polygons={group.polygons}
        />
      ))}
    </LayerGroup>
  )
}
