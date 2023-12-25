/** @jsxImportSource theme-ui */

import { selectLoaNavaid } from "../../services/navaidApi"
import { useAppSelector } from "../../app/hooks"
import { LoaRow } from "../LoaRow"
import {
  selectEntryLoasByNavaid,
  selectExitLoasByNavaid,
} from "../../services/loaApi"
import { NavaidMarker } from "./NavaidMarker"

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
        <table sx={{ width: "100%", fontSize: 2 }}>
          <thead>
            <tr>
              <th>ADEP/ADES</th>
              <th>FL</th>
              <th>REMARK</th>
              <th>FROM</th>
              <th>TO</th>
            </tr>
          </thead>
          {!!xloasByNavaid.length && (
            <>
              <thead>
                <tr>
                  <th>Exit</th>
                </tr>
              </thead>
              <tbody>
                {xloasByNavaid.map((loa, idx) => (
                  <LoaRow
                    key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                    loa={loa}
                    showCop={false}
                  />
                ))}
              </tbody>
            </>
          )}
          {!!nloasByNavaid.length && (
            <>
              <thead>
                <tr>
                  <th>Entry</th>
                </tr>
              </thead>
              <tbody>
                {nloasByNavaid?.map((loa, idx) => (
                  <LoaRow
                    key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                    loa={loa}
                    showCop={false}
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
