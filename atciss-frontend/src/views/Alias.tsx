/** @jsxImportSource theme-ui */

import { useLoaderData } from "react-router-dom"
import { LOCAL_STORAGE_JWT_KEY } from "../app/auth/slice"

export const aliasLoader = async () => {
  const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY)

  const response = await fetch(`/api/aliases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export const Alias = () => {
  const aliases = useLoaderData() as string

  return (
    <pre
      sx={{
        fontSize: 2,
        whiteSpace: "pre-wrap",
        textIndent: "2em hanging each-line", // This is not implemented in any browser, yet but why not be future-proof
      }}
    >
      {aliases}
    </pre>
  )
}
