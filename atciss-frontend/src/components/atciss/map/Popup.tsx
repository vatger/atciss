import { Popup as LPopup } from "react-leaflet"

export const Popup = ({ ...props }) => (
  <LPopup pane={props.pane ?? "popupPane"} {...props} />
)
