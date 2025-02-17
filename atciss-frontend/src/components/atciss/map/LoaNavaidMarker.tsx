/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { LoaRow } from "components/atciss/LoaRow"
import { NavaidMarker } from "components/atciss/map/NavaidMarker"
import {
  selectEntryLoasByNavaid,
  selectExitLoasByNavaid,
} from "services/loaApi"
import { selectLoaNavaid } from "services/navaidApi"

export const LoaNavaidMarker = ({ designator }: { designator: string }) => {
  const navaid = useAppSelector((store) => selectLoaNavaid(store, designator))
  const xloasByNavaid = useAppSelector((store) =>
    selectExitLoasByNavaid(store, designator),
  )
  const nloasByNavaid = useAppSelector((store) =>
    selectEntryLoasByNavaid(store, designator),
  )

  return (
    navaid && (
      <NavaidMarker navaid={navaid}>
        <table
          sx={{
            fontSize: 2,
            fontFamily: "body",
            whiteSpace: "normal",
            minWidth: "50vw",
          }}
        >
          <thead>
            <tr>
              <th sx={{ pt: 0 }}>ROUTE</th>
              <th sx={{ pt: 0 }}>ADEP/ADES</th>
              <th sx={{ pt: 0 }}>FL</th>
              <th sx={{ pt: 0 }}>REMARK</th>
              <th sx={{ pt: 0 }}>FROM</th>
              <th sx={{ pt: 0 }}>TO</th>
            </tr>
          </thead>
          {!!xloasByNavaid.length && (
            <>
              <thead>
                <tr>
                  <th sx={{ pt: 1 }}>Exit</th>
                </tr>
              </thead>
              <tbody>
                {xloasByNavaid.map((loa, idx) => (
                  <LoaRow
                    key={`${loa.cop}-${(loa.adep ?? []).join("_")}-${(loa.ades ?? []).join("_")}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                    loa={loa}
                  />
                ))}
              </tbody>
            </>
          )}
          {!!nloasByNavaid.length && (
            <>
              <thead>
                <tr>
                  <th sx={{ pt: 1 }}>Entry</th>
                </tr>
              </thead>
              <tbody>
                {nloasByNavaid?.map((loa, idx) => (
                  <LoaRow
                    key={`${loa.cop}-${(loa.adep ?? []).join("_")}-${(loa.ades ?? []).join("_")}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                    loa={loa}
                  />
                ))}
              </tbody>
            </>
          )}
        </table>
      </NavaidMarker>
    )
  )
}
