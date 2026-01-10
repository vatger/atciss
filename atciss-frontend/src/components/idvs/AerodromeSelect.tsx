import { useAppDispatch, useAppSelector } from "app/hooks"
import {
  selectAerodromesWithPrefixes,
  selectIdvsAerodromes,
} from "services/aerodrome"
import { api } from "services/api"
import { selectActiveAerodrome, setActiveAerodrome } from "services/idvsSlice"
import { usePollMetarByIcaoCodes } from "services/metarApi"
import { Select, ThemeUIStyleObject } from "theme-ui"

const AD_PREFIXES = ["ED", "ET"]

export const AerodromeSelect = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  api.useAerodromesByPrefixesQuery(AD_PREFIXES)
  const icaos = Object.keys(
    useAppSelector((store) => selectAerodromesWithPrefixes(store, AD_PREFIXES)),
  )
  usePollMetarByIcaoCodes(icaos, { skip: !icaos.length })
  const metarIcaos = useAppSelector((store) =>
    selectIdvsAerodromes(store, AD_PREFIXES),
  )
  const dispatch = useAppDispatch()

  return (
    <Select
      variant={"xmSelectXl"}
      onChange={(e) => dispatch(setActiveAerodrome(e.target.value))}
      value={aerodrome}
      sx={{ fontSize: 5, textAlign: "center", ...sx }}
    >
      {metarIcaos.map((ad) => (
        <option key={ad}>{ad}</option>
      ))}
    </Select>
  )
}
