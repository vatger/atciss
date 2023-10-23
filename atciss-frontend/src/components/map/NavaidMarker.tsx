import L, { LatLngExpression } from "leaflet"
import { Marker } from "react-leaflet"
import { selectLOANavaid } from "../../services/navaidApi"
import { useAppSelector } from "../../app/hooks"

const icons: { [key: string]: string } = {
  rnav: `<g><path fill="#FFFFFF" d="M32,27.4l10.5,18.1h-21L32,27.4 M32,9.4L5.9,54.6h52.1L32,9.4L32,9.4z"/><path d="M32,21.4l15.7,27.1H16.3L32,21.4 M32,9.4L5.9,54.6h52.1L32,9.4L32,9.4z"/><path fill="#FFFFFF" d="M32,9.4l26.1,45.1H5.9L32,9.4 M32,3.4l-2.6,4.5L3.3,53.1l-2.6,4.5h5.2h52.1h5.2l-2.6-4.5L34.6,7.9L32,3.4 L32,3.4z"/></g>`,
  dme: `
  <g><path fill="#FFFFFF" d="M48.3,20v25H15.7V20H48.3 M58.3,10H5.7v45h52.7V10L58.3,10z"/><path d="M52.3,16v33H11.7V16H52.3 M58.3,10H5.7v45h52.7V10L58.3,10z"/><path fill="#FFFFFF" d="M58.3,10v45H5.7V10H58.3 M61.3,7h-3H5.7h-3v3v45v3h3h52.7h3v-3V10V7L61.3,7z"/></g>
  <g><path fill="#FFFFFF" d="M31.5,26.7c3.2,0,5.8,2.6,5.8,5.8c0,3.2-2.6,5.8-5.8,5.8c-3.2,0-5.8-2.6-5.8-5.8 C25.7,29.3,28.3,26.7,31.5,26.7 M31.5,23.7c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8s8.8-3.9,8.8-8.8S36.3,23.7,31.5,23.7L31.5,23.7 z"/><circle cx="31.5" cy="32.5" r="5.8"/></g>`,
  vor_dme: `
  <g><path fill="#FFFFFF" d="M48.3,20v25H15.7V20H48.3 M58.3,10H5.7v45h52.7V10L58.3,10z"/><path d="M52.3,16v33H11.7V16H52.3 M58.3,10H5.7v45h52.7V10L58.3,10z"/><path fill="#FFFFFF" d="M58.3,10v45H5.7V10H58.3 M61.3,7h-3H5.7h-3v3v45v3h3h52.7h3v-3V10V7L61.3,7z"/></g>
  <g><path fill="#FFFFFF" d="M39.1,19.9l7.2,12.5l-7.2,12.5H24.7l-7.2-12.5l7.2-12.5H39.1 M44.9,9.9h-26L6,32.4l13,22.5h26l13-22.5 L44.9,9.9L44.9,9.9z"/><path d="M41.4,15.9l9.5,16.5l-9.5,16.5h-19l-9.5-16.5l9.5-16.5H41.4 M44.9,9.9h-26L6,32.4l13,22.5h26l13-22.5L44.9,9.9L44.9,9.9z"/></g>
  <g><path fill="#FFFFFF" d="M31.5,26.7c3.2,0,5.8,2.6,5.8,5.8c0,3.2-2.6,5.8-5.8,5.8c-3.2,0-5.8-2.6-5.8-5.8 C25.7,29.3,28.3,26.7,31.5,26.7 M31.5,23.7c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8s8.8-3.9,8.8-8.8S36.3,23.7,31.5,23.7L31.5,23.7 z"/><circle cx="31.5" cy="32.5" r="5.8"/></g>`,
  ndb: `
  <g opacity="0.39"><ellipse fill="#FFFFFF" cx="32" cy="32" rx="30.8" ry="29.8"/></g>
  <g><circle cx="32" cy="32" r="10.3"/><path fill="#FFFFFF" d="M32,23.2c4.8,0,8.8,3.9,8.8,8.8s-3.9,8.8-8.8,8.8s-8.8-3.9-8.8-8.8S27.2,23.2,32,23.2 M32,20.2 c-6.5,0-11.8,5.3-11.8,11.8S25.5,43.8,32,43.8S43.8,38.5,43.8,32S38.5,20.2,32,20.2L32,20.2z"/></g>`,
}

const getIcon = (type: string, label: string) => {
  let html = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">`

  type = type.toLowerCase()

  if (Object.keys(icons).includes(type)) {
    html += icons[type]
  } else {
    html += icons["rnav"] // TODO: Fix ICAO, Terminal, etc.
  }

  html += `</svg><div class="navaid-label">${label}</div>` // TODO: Sanitize

  return L.divIcon({
    html: html,
    className: `navaid navaid-${type}`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export type NavaidMarkerProps = {
  designator: string
}

export const NavaidMarker = ({ designator }: NavaidMarkerProps) => {
  const navaid = useAppSelector((store) => selectLOANavaid(store, designator))

  return (
    navaid && (
      <Marker
        position={navaid.location as LatLngExpression}
        icon={getIcon(navaid.type, navaid.designator)}
      />
    )
  )
}
