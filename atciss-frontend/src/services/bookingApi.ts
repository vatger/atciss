export type Booking = {
  id: number
  cid: number
  type: string
  callsign: string
  start: string
  end: string
  division: string
  subdivision: string | null
}

// export const usePollBookingsByRegions: typeof api.useBookingsByRegionsQuery = (
//   regions,
//   options,
// ) =>
//   api.useBookingsByRegionsQuery(regions, {
//     pollingInterval: 60000,
//     ...options,
//   })
//
// const selectByNeighbours = createSelector(
//   selectNeighbourPrefixes,
//   api.endpoints.bookingsByRegions.select,
// )
// export const selectAllBookings = createSelector(
//   (state: RootState) => state,
//   selectByNeighbours,
//   (state, selector) =>
//     selector(state)?.data?.map((b) => ({
//       id: b.id,
//       title: b.cid.toString(),
//       group: b.callsign,
//       startTime: DateTime.fromISO(b.start, { zone: "UTC" })
//         .toLocal()
//         .toMillis(),
//       endTime: DateTime.fromISO(b.end, { zone: "UTC" }).toLocal().toMillis(),
//     })) ?? [],
// )
//
// const dataFromCallsign = (callsign: string) => {
//   const splits = callsign.split("_")
//   return {
//     region: callsign.slice(0, 2),
//     prefix: splits.shift(),
//     type: splits.pop(),
//   }
// }
//
// const typePriority: { [type: string]: number } = {
//   CTR: 1,
//   APP: 2,
//   DEP: 2,
//   TWR: 3,
//   GND: 4,
//   DEL: 5,
// }

// export const selectBookedStations = createSelector(
//   selectAllBookings,
//   (bookings) =>
//     [...new Set(bookings.map((b) => b.group))]
//       .map((callsign) => ({
//         id: callsign,
//         title: callsign,
//       }))
//       .toSorted(({ id: a }, { id: b }) => {
//         const aData = dataFromCallsign(a)
//         const bData = dataFromCallsign(b)
//         if (aData.region != bData.region) {
//           if (["ED", "ET"].includes(aData.region)) return -1
//           if (["ED", "ET"].includes(bData.region)) return 1
//           return aData.region.localeCompare(bData.region)
//         }
//         if ((aData.type === "CTR") !== (bData.type === "CTR")) {
//           return aData.type === "CTR" ? -1 : 1
//         }
//         if (aData.prefix != bData.prefix) {
//           return aData.prefix!.localeCompare(bData.prefix!)
//         }
//         if (aData.type !== bData.type) {
//           return (
//             typePriority[aData.type ?? "DEL"] -
//             typePriority[bData.type ?? "DEL"]
//           )
//         }
//
//         return a.localeCompare(b)
//       }),
// )
