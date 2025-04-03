import { useAppDispatch, useAppSelector } from "app/hooks"
import { selectLoaViewMode, setLoaViewMode } from "services/loaDocsSlice"
import { Button, Flex } from "theme-ui"

export const LoaControls = () => {
  const dispatch = useAppDispatch()
  const viewMode = useAppSelector(selectLoaViewMode)

  return (
    <Flex sx={{ justifyContent: "space-evenly", gap: 2, alignItems: "center" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-layout"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
      <Button
        variant={viewMode != "docs" ? "selectedSecondaryNav" : "secondaryNav"}
        sx={{ flex: 1 }}
        onClick={() => dispatch(setLoaViewMode("agreements"))}
      >
        Agreements
      </Button>
      <Button
        variant={viewMode == "docs" ? "selectedSecondaryNav" : "secondaryNav"}
        sx={{ flex: 1 }}
        onClick={() => dispatch(setLoaViewMode("docs"))}
      >
        Documents
      </Button>
    </Flex>
  )
}
