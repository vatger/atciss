import { useAppSelector } from "app/hooks"
import { ICONS } from "components/atciss/map/NavaidMarker"
import { SearchInput } from "components/atciss/map/search/SearchInput"
import { Map } from "leaflet"
import { Fragment, ReactNode, RefObject } from "react"
import { selectSearch } from "services/mapSlice"
import { navaidApi, selectSearchedNavaids } from "services/navaidApi"
import { Box, Grid } from "theme-ui"

export const Search = ({
  children,
  map,
}: {
  children: ReactNode
  map: RefObject<Map>
}) => {
  const search = useAppSelector(selectSearch)
  navaidApi.useSearchQuery(search, {
    skip: search.length < 2,
  })

  const foundNavaids = useAppSelector(selectSearchedNavaids)

  return (
    <>
      <Box>
        <SearchInput />
      </Box>
      {search.length >= 2 ? (
        <Grid sx={{ gridTemplateColumns: "auto 1fr", overflow: "auto" }}>
          {foundNavaids?.map((n) => (
            <Fragment key={n.id}>
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => map.current?.flyTo(n.location, 9)}
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlSpace="preserve"
                  height="1rem"
                  viewBox="0 0 64 64"
                >
                  {ICONS[n.type.toLowerCase()] ?? ICONS["rnav"]}
                </svg>
              </Box>
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => map.current?.flyTo(n.location, 9)}
              >
                <Box>{n.designator}</Box>
                <Box>
                  {n.name}
                  {n.frequency && ` (${n.frequency})`}
                </Box>
              </Box>
            </Fragment>
          ))}
        </Grid>
      ) : (
        <>{children}</>
      )}
    </>
  )
}
