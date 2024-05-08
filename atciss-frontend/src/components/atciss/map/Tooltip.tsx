import { Tooltip as LTooltip } from "react-leaflet"

export const Tooltip = ({ ...props }) => (
  <LTooltip pane={props.pane ?? "tooltipPane"} {...props} />
)
