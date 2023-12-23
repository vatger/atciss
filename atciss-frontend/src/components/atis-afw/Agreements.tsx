import { Textarea } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import {
  agreementsApi,
  selectAgreements,
  usePollAgreements,
} from "../../services/agreementsApi"
import { selectActiveFir } from "../../services/configSlice"
import { useRef, useState } from "react"

export const Agreements = () => {
  const agreements = useAppSelector(selectAgreements)
  const fir = useAppSelector(selectActiveFir)
  const { data: _a } = usePollAgreements(fir)
  const [edit] = agreementsApi.useEditMutation()
  const [value, setValue] = useState(agreements)
  const textarea = useRef<HTMLTextAreaElement>(null)

  return (
    <Textarea
      ref={textarea}
      value={textarea.current === document.activeElement ? value : agreements}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      onBlur={(e) => {
        edit({ fir, agreements: e.target.value })
      }}
      onFocus={() => {
        setValue(agreements)
      }}
      sx={{
        height: "100%",
        border: 2,
        borderRadius: 0,
        borderStyle: "inset",
      }}
    ></Textarea>
  )
}
