import { ReactEventHandler, ReactNode, useEffect, useRef } from "react"
import { Box, ThemeUIStyleObject } from "theme-ui"

export const Dialog = ({
  open,
  onClose,
  children,
  dialogStyle,
  sx,
}: {
  open: boolean
  onClose: ReactEventHandler<HTMLDialogElement>
  children: ReactNode
  dialogStyle?: React.CSSProperties
  sx?: ThemeUIStyleObject
}) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [open])

  return (
    <dialog
      style={{ border: "none", padding: "0", ...dialogStyle }}
      ref={ref}
      onCancel={onClose}
    >
      <Box
        sx={{
          ...sx,
        }}
      >
        {children}
      </Box>
    </dialog>
  )
}
