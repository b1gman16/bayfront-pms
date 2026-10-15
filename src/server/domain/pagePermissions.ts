// Which permission a page needs. Checked in the main layout for every page under it.
const RULES: [string, string][] = [
  ["/reservations/new", "reservation.create"],
  ["/reservations", "reservation.view"],
  ["/calendar", "reservation.view"],
  ["/guests", "guest.view"],
  ["/payments", "payment.view"],
  ["/housekeeping", "housekeeping.view"],
  ["/maintenance", "maintenance.report"],
  ["/rooms", "room.view"],
  ["/audit", "audit.view"],
  ["/settings", "user.manage"],
];

export function permissionForPath(path: string): string | null {
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/front-desk") return "checkin";
  if (p.startsWith("/front-desk/")) return "folio.view";   // a single bill
  for (const [prefix, perm] of RULES) if (p === prefix || p.startsWith(prefix + "/")) return perm;
  return null;   // dashboard, account, reports (reports check their own access) and others
}