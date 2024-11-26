/** @jsxImportSource theme-ui */

import { selectIsFirAdmin } from "app/auth/slice"
import { FIR_SETTINGS } from "app/config"
import { useAppSelector } from "app/hooks"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { api } from "services/api"
import { selectActiveFir } from "services/configSlice"
import { selectInitials } from "services/initialsApi"
import { Button, Flex, Input, Link } from "theme-ui"

const AddInitials = () => {
  const fir = useAppSelector(selectActiveFir)
  const [cid, setCid] = useState("")
  const [initials, setInitials] = useState("")
  const [addInitials] = api.useAddInitialMutation()
  return (
    <Flex sx={{ gap: 2, alignItems: "start" }}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await addInitials({ fir, cid, initials })
        }}
      >
        <Input
          placeholder="CID"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
        />
        <Input
          placeholder="Initials"
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
        />
        <Button sx={{ minWidth: "50px" }} type="submit">
          Add
        </Button>
      </form>
    </Flex>
  )
}

type Column = "initials" | "cid"

export const Initials = () => {
  const fir = useAppSelector(selectActiveFir)
  api.useInitialsByFirQuery(fir)
  const initials = useAppSelector(selectInitials)
  const isFirAdmin = useAppSelector(selectIsFirAdmin)
  const [key, setKey] = useState<Column>("initials")
  const [direction, setDirection] = useState(1)
  const headerClick = (column: Column) => {
    if (key == column) {
      setDirection(direction * -1)
    } else {
      setKey(column)
    }
  }
  const sortIndicator = (column: Column) => (
    <> {key == column ? (direction > 0 ? "▲" : "▼") : ""}</>
  )
  const [deleteInitials] = api.useDeleteInitialsMutation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!FIR_SETTINGS[fir].initials.enabled) {
      navigate("/")
    }
  }, [navigate, fir])

  return (
    <Flex sx={{ flexDirection: "column", p: 2 }}>
      {isFirAdmin && <AddInitials />}
      <table>
        <thead>
          <tr>
            <th onClick={() => headerClick("initials")}>
              Initials{sortIndicator("initials")}
            </th>
            <th onClick={() => headerClick("cid")}>
              CID{sortIndicator("cid")}
            </th>
          </tr>
        </thead>
        <tbody>
          {initials
            ?.toSorted((a, b) => {
              return a[key].localeCompare(b[key]) * direction
            })
            .map((initials) => (
              <tr key={initials.id}>
                <td>{initials.initials}</td>
                <td>
                  <Link
                    href={`https://stats.vatsim.net/stats/${initials.cid}`}
                    target="_blank"
                  >
                    {initials.cid}
                  </Link>
                </td>
                {isFirAdmin && (
                  <td>
                    <Button
                      onClick={async () => await deleteInitials(initials)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </Flex>
  )
}
