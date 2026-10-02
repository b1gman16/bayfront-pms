export type Role = "OWNER" | "MANAGER" | "FRONT_DESK" | "HOUSEKEEPING" | "CASHIER";

const FRONT = ["reservation.view","reservation.create","reservation.edit","reservation.cancel",
  "guest.view","guest.edit","checkin","checkout","payment.record","payment.view","room.status","room.view","folio.view","folio.charge",
  "housekeeping.view","maintenance.report"];

export const PERMISSIONS: Record<Role, readonly string[]> = {
  OWNER: ["*"],
  MANAGER: [...FRONT, "payment.refund","folio.void","room.manage","rate.manage","report.view","report.financial",
    "housekeeping.manage","housekeeping.update","maintenance.manage","user.manage","audit.view","checkout.override"],
  FRONT_DESK: FRONT,
  HOUSEKEEPING: ["room.view","room.status.clean","housekeeping.view","housekeeping.update","maintenance.report"],
  CASHIER: ["payment.record","payment.view","payment.refund.request","folio.view","folio.charge","reservation.view","report.financial"],
};

export function can(role: Role, permission: string): boolean {
  const p = PERMISSIONS[role];
  return p.includes("*") || p.includes(permission);
}

export function assertCan(role: Role, permission: string): void {
  if (!can(role, permission)) throw new Error(`Forbidden: ${permission}`);
}