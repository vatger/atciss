import { useAppSelector } from "app/hooks"
import { useRef, useState } from "react"
import { selectAgreements, usePollAgreements } from "services/agreementsApi"
import { api } from "services/api"
import { selectActiveFir } from "services/configSlice"
import { Textarea } from "theme-ui"

export const Agreements = () => {
  const agreements = useAppSelector(selectAgreements)
  const fir = useAppSelector(selectActiveFir)
  usePollAgreements(fir)
  const [edit] = api.useEditAgreementMutation()
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
        fontFamily: "monospace",
      }}
    ></Textarea>
  )
}
