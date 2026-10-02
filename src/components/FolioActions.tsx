"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

const METHODS = ["CASH", "GCASH", "MAYA", "CARD", "BANK_TRANSFER", "OTHER"];
const peso = (c: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(c / 100);

export default function FolioActions({ reservationId, folioId, balance, canOverride }: { reservationId: string; folioId: string; balance: number; canOverride: boolean }) {
  const router = useRouter(); const key = useRef(crypto.randomUUID());
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) { setBusy(true); setErr(""); setMsg(""); const r = await fn(); setBusy(false); if (r.ok) { setMsg(ok); router.refresh(); } else setErr(r.error ?? "Failed"); }
  function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const pesos = Number(f.get("amount"));
    run(async () => { const r = await call(`/api/v1/folios/${folioId}/payments`, "POST", { amount: Math.round(pesos * 100), method: f.get("method"), reference: f.get("reference") || undefined, idempotencyKey: key.current });
      if (r.ok) key.current = crypto.randomUUID(); return r; }, "Payment recorded.");
  }
  function charge(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const form = e.currentTarget;
    run(async () => { const r = await call(`/api/v1/folios/${folioId}/items`, "POST", { category: f.get("category"), description: f.get("description"), qty: Number(f.get("qty")), unitPesos: Number(f.get("price")) }); if (r.ok) form.reset(); return r; }, "Charge added.");
  }
  async function out(override: boolean) {
    const t = override ? `Check out with an UNPAID balance of ${peso(balance)}? This will be recorded.` : "Check out this guest? The folio will be closed.";
    if (!window.confirm(t)) return;
    run(() => call(`/api/v1/reservations/${reservationId}/check-out`, "POST", { override }), "Checked out.");
  }
  const sec = "space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
  return (<div className="grid gap-4 lg:grid-cols-2">
    <form onSubmit={pay} className={sec}><h2 className="font-semibold">Record payment</h2>
      <div className="grid grid-cols-2 gap-3"><input name="amount" type="number" step="0.01" min="1" required defaultValue={balance > 0 ? balance / 100 : ""} aria-label="Amount in pesos" placeholder="Amount (₱)" className={field} />
        <select name="method" className={field}>{METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
      <input name="reference" placeholder="Reference number (GCash, card, bank)" className={field} /><button disabled={busy} className={btn}>Record payment</button></form>
    <form onSubmit={charge} className={sec}><h2 className="font-semibold">Add charge</h2>
      <div className="grid grid-cols-2 gap-3"><select name="category" className={field}>{["FOOD_BEVERAGE", "EXTRA_BED", "ACTIVITY", "EQUIPMENT", "OTHER"].map(m => <option key={m}>{m}</option>)}</select>
        <input name="qty" type="number" min="1" defaultValue="1" aria-label="Quantity" className={field} /></div>
      <div className="grid grid-cols-2 gap-3"><input name="description" required placeholder="Description" className={field} /><input name="price" type="number" step="0.01" min="1" required placeholder="Price each (₱)" className={field} /></div>
      <button disabled={busy} className={btn}>Add charge</button></form>
    <div className={`${sec} lg:col-span-2`}>
      {balance > 0 ? <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-700">Unpaid balance: {peso(balance)}. Record payment before checking out.</p> : <p className="rounded bg-emerald-50 p-3 text-sm font-medium text-emerald-700">Fully paid. Ready to check out.</p>}
      <div className="flex flex-wrap gap-3"><button disabled={busy || balance > 0} onClick={() => out(false)} className={btn}>Check out</button>
        {balance > 0 && canOverride && <button disabled={busy} onClick={() => out(true)} className="rounded-md border border-red-300 px-3.5 py-2 text-sm text-red-700 hover:bg-red-50">Manager: check out with unpaid balance</button>}</div>
      {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}{err && <p role="alert" className="text-sm text-red-700">{err}</p>}</div></div>);
}