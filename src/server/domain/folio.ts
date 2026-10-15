export interface FolioLine { qty: number; unitAmount: number; voided?: boolean }
export interface Rule { name: string; kind: "TAX" | "FEE" | "DISCOUNT"; type: "PERCENT" | "FIXED";
  value: number; compound?: boolean; active: boolean; sortOrder?: number }  // PERCENT = basis points (1200 = 12%)
export interface Totals { subtotal: number; discounts: number; fees: number; taxes: number; total: number;
  paid: number; refunded: number; balance: number; breakdown: { name: string; kind: string; amount: number }[] }

const amountOf = (r: Rule, base: number) => Math.round(r.type === "PERCENT" ? (base * r.value) / 10_000 : r.value);

/** Subtotal -> discounts -> fees -> taxes -> total -> payments -> balance. All integer centavos. */
export function computeFolio(lines: FolioLine[], rules: Rule[], payments: { amount: number; kind: "PAYMENT" | "REFUND" }[]): Totals {
  const subtotal = lines.filter(l => !l.voided).reduce((s, l) => s + l.qty * l.unitAmount, 0);
  const active = rules.filter(r => r.active).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const breakdown: Totals["breakdown"] = [];
  let discounts = 0, fees = 0, taxes = 0;

  for (const r of active.filter(r => r.kind === "DISCOUNT")) {
    const a = Math.min(amountOf(r, subtotal - discounts), subtotal - discounts);
    discounts += a; breakdown.push({ name: r.name, kind: r.kind, amount: -a });
  }
  const net = subtotal - discounts;
  for (const r of active.filter(r => r.kind === "FEE")) {
    const a = amountOf(r, net); fees += a; breakdown.push({ name: r.name, kind: r.kind, amount: a });
  }
  for (const r of active.filter(r => r.kind === "TAX")) {
    const a = amountOf(r, r.compound ? net + fees : net); taxes += a; breakdown.push({ name: r.name, kind: r.kind, amount: a });
  }
  const total = net + fees + taxes;
  const paid = payments.filter(p => p.kind === "PAYMENT").reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter(p => p.kind === "REFUND").reduce((s, p) => s + p.amount, 0);
  return { subtotal, discounts, fees, taxes, total, paid, refunded, balance: total - (paid - refunded), breakdown };
}

/** The rules to save on a bill when it is closed: plain values, active rules only. */
export function snapshotRules(rules: Rule[]): Rule[] {
  return rules.filter(r => r.active).map(r => ({
    name: r.name, kind: r.kind, type: r.type, value: r.value, compound: !!r.compound, active: true, sortOrder: r.sortOrder ?? 0 }));
}

/** A closed bill uses the rules saved on it. An open bill (no saved rules) uses today's rules. */
export function rulesForFolio(snapshot: unknown, live: Rule[]): Rule[] {
  return Array.isArray(snapshot) ? (snapshot as Rule[]) : live;
}

export const formatPHP = (centavos: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(centavos / 100);