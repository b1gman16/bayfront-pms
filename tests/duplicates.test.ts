import { describe, it, expect } from "vitest";
import { findDuplicateGroups, normPhone, normName } from "../src/server/domain/duplicates";

const g = (id: string, fullName: string, phone: string | null = null, email: string | null = null) => ({ id, fullName, phone, email });

describe("duplicate guests", () => {
  it("matches the same phone written two ways", () => {
    expect(normPhone("0917 123 4567")).toBe(normPhone("+63 917 123 4567"));
    const r = findDuplicateGroups([g("a", "Maria Santos", "0917 123 4567"), g("b", "M. Santos", "+63 917 123 4567")]);
    expect(r).toHaveLength(1); expect(r[0].reasons).toEqual(["phone"]);
  });
  it("matches an email regardless of case", () => {
    const r = findDuplicateGroups([g("a", "Ana Cruz", null, "Ana@Example.com"), g("b", "Anna Cruz", null, " ana@example.com ")]);
    expect(r[0].reasons).toEqual(["email"]);
  });
  it("matches the same name in another order, with accents", () => {
    expect(normName("Santos, María")).toBe(normName("maria santos"));
    expect(findDuplicateGroups([g("a", "Maria Santos"), g("b", "Santos, María")])[0].reasons).toEqual(["name"]);
  });
  it("keeps different people apart", () => {
    expect(findDuplicateGroups([g("a", "Maria Santos", "0917 123 4567", "m@x.com"), g("b", "Juan Dela Cruz", "0920 555 0101", "j@x.com")])).toEqual([]);
  });
  it("joins three records linked by different matches into one group", () => {
    const r = findDuplicateGroups([g("a", "Jo Reyes", "0917 111 2222"), g("b", "Joanna Reyes", "0917 111 2222", "j@x.com"), g("c", "J. Reyes", null, "j@x.com")]);
    expect(r).toHaveLength(1); expect(r[0].guests.map(x => x.id).sort()).toEqual(["a", "b", "c"]);
    expect(r[0].reasons).toEqual(["phone", "email"]);
  });
  it("ignores empty or too-short phone numbers", () => {
    expect(findDuplicateGroups([g("a", "A One", "123"), g("b", "B Two", "123"), g("c", "C Three", ""), g("d", "D Four", "")])).toEqual([]);
  });
});