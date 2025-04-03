/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { selectLoaViewMode } from "services/loaDocsSlice"
import { ThemeUIStyleObject } from "theme-ui"
import { LOADoc } from "./LOADoc"
import { LOATable } from "./LOATable"

export const LOA = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const userViewMode = useAppSelector(selectLoaViewMode)

  if (userViewMode == "docs") {
    return <LOADoc sx={sx} />
  } else {
    return <LOATable sx={sx} />
  }
}
