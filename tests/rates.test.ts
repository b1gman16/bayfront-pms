import { describe, it, expect } from "vitest";
import { nightRate, priceNights, bandsOf, ratesFor, repriceNights, sumRates, roomLine, RateRuleLite } from "../src/server/domain/rates";

const d = (s: string) => new Date(s + "T00:00:00.000Z");
const rule = (o: Partial<RateRuleLite>): RateRuleLite => ({ roomTypeId: null, name: "Rule", startDate: null, endDate: null, days: [], rate: 999, priority: 0, active: true, ...o });
const BASE = 250000;

describe("pricing a stay", () => {
  const weekend = rule({ name: "Weekend", days: [5, 6], rate: 350000, priority: 10 });
  it("uses the base rate when no rule matches", () => {
    expect(priceNights(BASE, [], "t", d("2026-10-15"), d("2026-10-17")).map(n => n.rate)).toEqual([BASE, BASE]);
  });
  it("charges the weekend rate on Fri and Sat nights only (Oct 15 2026 is a Thursday)", () => {
    const r = priceNights(BASE, [weekend], "t", d("2026-10-15"), d("2026-10-19")).map(n => n.rate);
    expect(r).toEqual([250000, 350000, 350000, 250000]);
    expect(sumRates(r)).toBe(1_200_000);
  });
  it("a higher-priority season beats the weekend rate", () => {
    const season = rule({ name: "Peak", startDate: d("2026-10-15"), endDate: d("2026-10-20"), rate: 500000, priority: 20 });
    expect(priceNights(BASE, [weekend, season], "t", d("2026-10-15"), d("2026-10-19")).map(n => n.rate)).toEqual([500000, 500000, 500000, 500000]);
  });
  it("a room-type rule only applies to that type", () => {
    const r = rule({ roomTypeId: "deluxe", rate: 400000 });
    expect(nightRate(BASE, [r], "std", d("2026-10-15")).rate).toBe(BASE);
    expect(nightRate(BASE, [r], "deluxe", d("2026-10-15")).rate).toBe(400000);
  });
  it("ignores inactive rules and treats the end date as inclusive", () => {
    expect(nightRate(BASE, [rule({ active: false, rate: 1 })], "t", d("2026-10-15")).rate).toBe(BASE);
    const r = rule({ endDate: d("2026-10-16"), rate: 300000 });
    expect(nightRate(BASE, [r], "t", d("2026-10-16")).rate).toBe(300000);
    expect(nightRate(BASE, [r], "t", d("2026-10-17")).rate).toBe(BASE);
  });
});

describe("bill lines and repricing", () => {
  it("groups consecutive nights with the same price", () => {
    const b = bandsOf([250000, 350000, 350000, 250000].map(rate => ({ rate })), d("2026-10-15"));
    expect(b.map(x => [x.nights, x.rate])).toEqual([[1, 250000], [2, 350000], [1, 250000]]);
    expect(b[1].start.toISOString().slice(0, 10)).toBe("2026-10-16");
  });
  it("older reservations fall back to their single rate; saved prices win", () => {
    const base = { ratePerNight: 300000, checkIn: d("2026-10-15"), checkOut: d("2026-10-18") };
    expect(ratesFor({ ...base, nightly: null })).toEqual([300000, 300000, 300000]);
    expect(ratesFor({ ...base, nightly: [1, 2, 3] })).toEqual([1, 2, 3]);
    expect(ratesFor({ ...base, nightly: [1, 2] })).toEqual([300000, 300000, 300000]);   // wrong length is ignored
  });
  it("extending keeps old nights and prices new ones; shortening drops the end", () => {
    const old = [250000, 350000];
    expect(repriceNights(d("2026-10-15"), old, d("2026-10-15"), d("2026-10-18"), () => 999)).toEqual([250000, 350000, 999]);
    expect(repriceNights(d("2026-10-15"), old, d("2026-10-15"), d("2026-10-16"), () => 999)).toEqual([250000]);
    expect(repriceNights(d("2026-10-15"), old, d("2026-10-16"), d("2026-10-18"), () => 999)).toEqual([350000, 999]);   // arrival moved later
  });
  it("labels bill lines", () => {
    expect(roomLine("101", 1, 250000, false)).toBe("Room 101 × 1 night");
    expect(roomLine("101", 2, 350000, true)).toBe("Room 101 × 2 nights @ ₱3,500");
  });
});