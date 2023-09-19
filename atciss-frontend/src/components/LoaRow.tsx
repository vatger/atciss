import { LoaItem } from "../services/loaApi"

export const LoaRow = ({ loa }: { loa: LoaItem }) => (
  <tr>
    <td>{loa.cop}</td>
    <td>
      {loa.adep_ades === "ADEP" && <>&#x02197;</>}
      {loa.adep_ades === "ADES" && <>&#x02198;</>} {loa.aerodrome}
    </td>
    <td>
      {loa.xc === "A" && <>&uarr;</>}
      {loa.xc === "B" && <>&darr;</>}
      {loa.feet ? `${loa.level}00ft` : `FL${loa.level}`}
    </td>
    <td>{loa.special_conditions}</td>
    <td>{loa.from_sector || loa.from_fir}</td>
    <td>{loa.to_sector || loa.to_fir}</td>
  </tr>
)
