import { useAppDispatch, useAppSelector } from "app/hooks"
import { Dialog } from "components/Dialog"
import {
  selectAtisRwyConfigOpen,
  setAtisRwyConfigOpen,
} from "services/idvsSlice"

export const RunwaySetupDialog = () => {
  const rwyDialogOpen = useAppSelector(selectAtisRwyConfigOpen)
  const dispatch = useAppDispatch()
  return (
    <Dialog
      open={rwyDialogOpen}
      onClose={() => {
        dispatch(setAtisRwyConfigOpen(false))
      }}
    >
      hello world
    </Dialog>
  )
}
