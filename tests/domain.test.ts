import { describe, it, expect } from "vitest";
import { isRoomFree, findAvailableRooms } from "../src/server/domain/availability";
import { computeFolio } from "../src/server/domain/folio";
import { can } from "../src/server/domain/permissions";

const d = (s: string) => new Date(s);
const room = { id: "r1", roomTypeId: "t1", status: "AVAILABLE" };

describe("availability", () => {
  const stays = [{ roomId: "r1", checkIn: d("2026-10-05"), checkOut: d("2026-10-08"), status: "CONFIRMED" }];
  it("allows same-day turnover", () => expect(isRoomFree(room, stays, d("2026-10-08"), d("2026-10-10"))).toBe(true));
  it("blocks overlap", () => expect(isRoomFree(room, stays, d("2026-10-07"), d("2026-10-09"))).toBe(false));
  it("ignores cancelled", () => expect(isRoomFree(room, [{ ...stays[0], status: "CANCELLED" }], d("2026-10-06"), d("2026-10-07"))).toBe(true));
  it("blocks maintenance rooms", () => expect(findAvailableRooms([{ ...room, status: "OUT_OF_ORDER" }], [], d("2026-10-01"), d("2026-10-02"))).toHaveLength(0));
  it("rejects invalid range", () => expect(isRoomFree(room, [], d("2026-10-02"), d("2026-10-02"))).toBe(false));
});

describe("folio", () => {
  const rules = [
    { name: "Service Charge", kind: "FEE" as const, type: "PERCENT" as const, value: 1000, active: true, sortOrder: 1 },
    { name: "VAT", kind: "TAX" as const, type: "PERCENT" as const, value: 1200, active: true, sortOrder: 2 },
  ];
  it("computes totals from configurable rules", () => {
    const t = computeFolio([{ qty: 2, unitAmount: 300000 }], rules, [{ amount: 100000, kind: "PAYMENT" }]);
    expect(t.subtotal).toBe(600000); expect(t.fees).toBe(60000); expect(t.taxes).toBe(72000);
    expect(t.total).toBe(732000); expect(t.balance).toBe(632000);
  });
  it("ignores voided lines and inactive rules", () => {
    const t = computeFolio([{ qty: 1, unitAmount: 500000, voided: true }], [{ ...rules[0], active: false }], []);
    expect(t.total).toBe(0);
  });
  it("refunds increase balance", () => {
    const t = computeFolio([{ qty: 1, unitAmount: 100000 }], [], [{ amount: 100000, kind: "PAYMENT" }, { amount: 20000, kind: "REFUND" }]);
    expect(t.balance).toBe(20000);
  });
});

describe("permissions", () => {
  it("housekeeping cannot take payments", () => expect(can("HOUSEKEEPING", "payment.record")).toBe(false));
  it("owner can do anything", () => expect(can("OWNER", "user.manage")).toBe(true));
  it("front desk cannot refund", () => expect(can("FRONT_DESK", "payment.refund")).toBe(false));
});
