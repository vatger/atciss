import { useAppDispatch, useAppSelector } from "app/hooks"
import { selectSearch, setSearch } from "services/mapSlice"
import { Input } from "theme-ui"

export const SearchInput = () => {
  const search = useAppSelector(selectSearch)
  const dispatch = useAppDispatch()

  return (
    <Input
      placeholder="Search"
      type="search"
      value={search}
      onChange={(e) => dispatch(setSearch(e.target.value))}
    />
  )
}
