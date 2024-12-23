import { useAppDispatch, useAppSelector } from "app/hooks"
import { XmInput } from "components/atciss/XmInput"
import { selectSearch, setSearch } from "services/mapSlice"

export const SearchInput = () => {
  const search = useAppSelector(selectSearch)
  const dispatch = useAppDispatch()

  return (
    <XmInput
      value={search}
      type="search"
      onChange={(e) => dispatch(setSearch(e.target.value))}
      sx={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold" }}
      placeholder={"Search"}
    />
  )
}
