/** @jsxImportSource theme-ui */

import { useAppSelector } from "../app/hooks"
import { selectActiveFir } from "../services/configSlice"
import { aliasesApi, selectAliases } from "../services/aliasesApi"

export const Alias = () => {
  const fir = useAppSelector(selectActiveFir)
  const { data: _a } = aliasesApi.useGetQuery(fir)
  const aliases = useAppSelector(selectAliases)

  return (
    <pre
      sx={{
        padding: 2,
        fontSize: 2,
        whiteSpace: "pre-wrap",
        textIndent: "2em hanging each-line", // This is not implemented in any browser, yet but why not be future-proof
      }}
    >
      {aliases}
    </pre>
  )
}
