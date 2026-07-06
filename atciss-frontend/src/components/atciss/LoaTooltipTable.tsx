/** @jsxImportSource theme-ui */

import { LoaRow } from "components/atciss/LoaRow"
import { LoaItem } from "types/loa"

export const LoaTooltipTable = ({
  exitAgreements,
  entryAgreements,
}: {
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
}) => {
  return (
    <table
      sx={{
        fontSize: 2,
        fontFamily: "body",
        whiteSpace: "normal",
        minWidth: "40vw",
        maxWidth: "50vw",
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
      {!!exitAgreements.length && (
        <>
          <thead>
            <tr>
              <th sx={{ pt: 1 }}>Exit</th>
            </tr>
          </thead>
          <tbody>
            {exitAgreements.map((loa, idx) => (
              <LoaRow
                key={
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  `${loa.cop ?? ""}-${(loa.adep ?? []).join("_")}-${(loa.ades ?? []).join("_")}-${loa.from_sector}-${loa.to_sector}-${loa.level}-${idx}`
                }
                loa={loa}
              />
            ))}
          </tbody>
        </>
      )}
      {!!entryAgreements.length && (
        <>
          <thead>
            <tr>
              <th sx={{ pt: 1 }}>Entry</th>
            </tr>
          </thead>
          <tbody>
            {entryAgreements.map((loa, idx) => (
              <LoaRow
                key={
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  `${loa.cop ?? ""}-${(loa.adep ?? []).join("_")}-${(loa.ades ?? []).join("_")}-${loa.from_sector}-${loa.to_sector}-${loa.level}-${idx}`
                }
                loa={loa}
              />
            ))}
          </tbody>
        </>
      )}
    </table>
  )
}
