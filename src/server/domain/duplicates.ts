export interface DupGuest { id: string; fullName: string; phone: string | null; email: string | null }
export type Reason = "phone" | "email" | "name";

/** Philippine numbers are compared by their last 10 digits, so 0917 123 4567 and +63 917 123 4567 match. */
export const normPhone = (p?: string | null) => { const d = (p ?? "").replace(/\D/g, ""); return d.length >= 7 ? d.slice(-10) : ""; };
export const normEmail = (e?: string | null) => (e ?? "").trim().toLowerCase();
/** Same words in any order, ignoring capitals, accents and punctuation: "Santos, Maria" = "maria santos". */
export const normName = (n: string) => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).sort().join(" ");

/** Groups of guests that probably are the same person. A group is only a suggestion: staff decide each merge. */
export function findDuplicateGroups<T extends DupGuest>(guests: T[]): { reasons: Reason[]; guests: T[] }[] {
  const parent = guests.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const why = guests.map(() => new Set<Reason>());
  const index = (reason: Reason, key: (g: T) => string) => {
    const m = new Map<string, number[]>();
    guests.forEach((g, i) => { const k = key(g); if (k) m.set(k, [...(m.get(k) ?? []), i]); });
    for (const ids of m.values()) if (ids.length > 1) ids.forEach(i => { why[i].add(reason); parent[find(i)] = find(ids[0]); });
  };
  index("phone", g => normPhone(g.phone));
  index("email", g => normEmail(g.email));
  index("name", g => normName(g.fullName));
  const groups = new Map<number, number[]>();
  guests.forEach((_, i) => { const r = find(i); groups.set(r, [...(groups.get(r) ?? []), i]); });
  return [...groups.values()].filter(ids => ids.length > 1).map(ids => ({
    reasons: (["phone", "email", "name"] as Reason[]).filter(r => ids.some(i => why[i].has(r))),
    guests: ids.map(i => guests[i]),
  }));
}