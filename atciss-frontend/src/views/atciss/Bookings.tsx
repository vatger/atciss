// eslint-disable-next-line  @typescript-eslint/ban-ts-comment
// @ts-nocheck

import "@florianbepunkt/timeline/src/timeline.scss"
import { Box } from "theme-ui"
import {
  selectAllBookings,
  selectBookedStations,
  usePollBookingsByRegions,
} from "../services/bookingApi"
import { useAppSelector } from "../app/hooks"
import { selectActiveFir } from "../services/configSlice"
import { FIR_SETTINGS } from "../app/config"
import { DateTime, Duration } from "luxon"
import {
  ItemRendererProps,
  NowMarker,
  Timeline,
  TimelineGroupBase,
  TimelineItemBase,
} from "@florianbepunkt/timeline"
import {
  MarkersProvider,
  MarkersRenderer,
} from "@florianbepunkt/timeline/dist/markers"
import { useAppTheme } from "../app/theme"

const minTime = DateTime.now()
  .startOf("week")
  .minus(Duration.fromObject({ weeks: 1 }))
  .toMillis()
const maxTime = DateTime.now()
  .startOf("week")
  .plus(Duration.fromObject({ weeks: 12 }))
  .toMillis()

const onTimeChange = (
  visibleTimeStart: number,
  visibleTimeEnd: number,
  updateScrollCanvas: (start: number, end: number) => void,
) => {
  if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
    updateScrollCanvas(minTime, maxTime)
  } else if (visibleTimeStart < minTime) {
    updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
  } else if (visibleTimeEnd > maxTime) {
    updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
  } else {
    updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
  }
}

export const Item = (
  props: ItemRendererProps<TimelineItemBase, TimelineGroupBase>,
) => {
  const { item, itemContext, getItemProps, getResizeProps } = props
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
  const itemProps = getItemProps(item.itemProps)
  const theme = useAppTheme()

  return (
    <Box
      {...itemProps}
      style={{ ...itemProps.style, background: theme.colors.primary }}
    >
      {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ""}
      <div
        className="rct-item-content"
        style={{ maxHeight: `${itemContext.dimensions.height}` }}
      >
        {itemContext.title}
      </div>
      {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ""}
    </Box>
  )
}

export const Bookings = () => {
  const fir = useAppSelector(selectActiveFir)
  usePollBookingsByRegions(FIR_SETTINGS[fir].neighbourPrefixes)
  const bookings = useAppSelector(selectAllBookings)
  const bookedStations = useAppSelector(selectBookedStations)
  const theme = useAppTheme()

  return (
    <Box
      sx={{
        width: "100%",
        "--mui-palette-primary-main": theme.colors.primary,
        "--mui-palette-primary-900": theme.colors.darkshadow,
        "--mui-palette-primary-200": theme.colors.brightshadow,
        "--mui-palette-common-white": theme.colors.background,
        "--mui-palette-primary-50": theme.colors.brightshadow,
        "--mui-palette-divider": theme.colors.darkshadow,
        "--mui-palette-text-primary": theme.colors.text,
        "--mui-palette-TableCell-border": theme.colors.darkshadow,
      }}
    >
      <Timeline
        groups={bookedStations}
        items={bookings}
        defaultTimeStart={DateTime.now().toMillis()}
        defaultTimeEnd={DateTime.now()
          .plus(Duration.fromObject({ days: 7 }))
          .toMillis()}
        minZoom={24 * 60 * 60 * 1000} // 1d
        maxZoom={28 * 24 * 60 * 60 * 1000} // 4w
        canMove={false}
        canChangeGroup={false}
        canResize={false}
        canSelect={false}
        onTimeChange={onTimeChange}
        stickyOffset={80}
        stickyHeader={true}
        itemRenderer={Item}
      >
        <MarkersProvider>
          <NowMarker id="today" />
          <MarkersRenderer />
        </MarkersProvider>
      </Timeline>
    </Box>
  )
}
