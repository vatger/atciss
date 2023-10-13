import "@florianbepunkt/timeline/src/timeline.scss"
import { Box } from "theme-ui"
import {
  selectAllBookings,
  selectBookedStations,
  usePollBookingsByRegions,
} from "../services/bookingApi"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { DateTime, Duration } from "luxon"
import { NowMarker, Timeline } from "@florianbepunkt/timeline"
import { MarkersProvider, MarkersRenderer } from "@florianbepunkt/timeline/dist/markers"

const minTime = DateTime.now()
  .startOf("week")
  .minus(Duration.fromObject({ weeks: 1 }))
  .toMillis()
const maxTime = DateTime.now()
  .startOf("week")
  .plus(Duration.fromObject({ weeks: 4 }))
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

export const Bookings = () => {
  const ebg = useAppSelector(selectActiveEbg)
  usePollBookingsByRegions(EBG_SETTINGS[ebg].neighbourPrefixes)
  const bookings = useAppSelector(selectAllBookings)
  const bookedStations = useAppSelector(selectBookedStations)

  return (
    <Box sx={{ width: "100%" }}>
      <Timeline
        groups={bookedStations}
        items={bookings}
        defaultTimeStart={DateTime.now().toMillis()}
        defaultTimeEnd={DateTime.now()
          .plus(Duration.fromObject({ days: 7 }))
          .toMillis()}
        minZoom={24 * 60 * 60 * 1000}
        maxZoom={28 * 24 * 60 * 60 * 1000}
        canMove={false}
        canChangeGroup={false}
        canResize={false}
        canSelect={false}
        onTimeChange={onTimeChange}
        stickyOffset={80}
        stickyHeader={true}
      >
        <MarkersProvider>
          <NowMarker id="today" />
          <MarkersRenderer />
        </MarkersProvider>
      </Timeline>
    </Box>
  )
}
