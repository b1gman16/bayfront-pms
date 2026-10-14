export interface Stay { roomId: string | null; checkIn: Date; checkOut: Date; status: string; id?: string }
export interface RoomLite { id: string; roomTypeId: string; status: string }

const ACTIVE = ["PENDING", "CONFIRMED", "CHECKED_IN"];
const BLOCKED = ["MAINTENANCE", "OUT_OF_ORDER"];

/** Half-open ranges: a guest leaving on the 5th does not block one arriving on the 5th. */
export const overlaps = (aIn: Date, aOut: Date, bIn: Date, bOut: Date) => aIn < bOut && bIn < aOut;

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}

export function isRoomFree(room: RoomLite, stays: Stay[], from: Date, to: Date, ignoreId?: string): boolean {
  if (to <= from) return false;
  if (BLOCKED.includes(room.status)) return false;
  return !stays.some(s => s.roomId === room.id && !(ignoreId && s.id === ignoreId) && ACTIVE.includes(s.status)
    && overlaps(s.checkIn, s.checkOut, from, to));
}

export function findAvailableRooms(rooms: RoomLite[], stays: Stay[], from: Date, to: Date,
  roomTypeId?: string, ignoreId?: string): RoomLite[] {
  return rooms.filter(r => (!roomTypeId || r.roomTypeId === roomTypeId) && isRoomFree(r, stays, from, to, ignoreId));
}
