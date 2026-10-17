"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";
import { call, field, btn } from "./api";

export type RateRow = { id: string; name: string; roomTypeId: string; startDate: string; endDate: string; days: number[]; ratePesos: number; priority: number; active: boolean };
export type TypeOpt = { id: string; name: string };
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;
const body = (r: RateRow, patch: Partial<RateRow> = {}) => { const x = { ...r, ...patch };
  return { name: x.name, roomTypeId: x.roomTypeId, startDate: x.startDate, endDate: x.endDate, days: x.days, ratePesos: x.ratePesos, priority: x.priority, active: x.active }; };

export function ToggleRate({ rule }: { rule: RateRow }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function go() {
    if (!window.confirm(`${rule.active ? "Turn off" : "Turn on"} "${rule.name}"? It only affects bookings made or changed from now on.`)) return;
    const r = await call(`/api/v1/rate-rules/${rule.id}`, "PATCH", body(rule, { active: !rule.active }));
    r.ok ? router.refresh() : setErr(r.error);
  }
  return <span><button onClick={go} className="text-sm text-brand hover:underline">{rule.active ? "Turn off" : "Turn on"}</button>{err && <span role="alert" className="ml-2 text-xs text-red-700">{err}</span>}</span>;
}

export function RateButton({ rule, types }: { rule?: RateRow; types: TypeOpt[] }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [days, setDays] = useState<number[]>(rule?.days ?? []);
  const toggle = (n: number) => setDays(d => (d.includes(n) ? d.filter(x => x !== n) : [...d, n]));
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const payload = { name: f.get("name"), roomTypeId: f.get("roomTypeId") || undefined, startDate: f.get("startDate") || undefined, endDate: f.get("endDate") || undefined,
      days, ratePesos: Number(f.get("ratePesos")), priority: Number(f.get("priority")), active: f.get("active") === "on" };
    const r = rule ? await call(`/api/v1/rate-rules/${rule.id}`, "PATCH", payload) : await call("/api/v1/rate-rules", "POST", payload);
    setBusy(false); if (r.ok) { setOpen(false); router.refresh(); } else setErr(r.error);
  }
  return (<>
    {rule ? <button onClick={() => setOpen(true)} aria-label={`Edit ${rule.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
      : <button onClick={() => setOpen(true)} className={`${btn} gap-1.5`}><Plus size={16} /> Add rate</button>}
    {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={rule ? `Edit ${rule.name}` : "Add rate"} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{rule ? `Edit ${rule.name}` : "Add rate"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
        <form onSubmit={submit} className="space-y-3">
          <L t="Name"><input name="name" required autoFocus defaultValue={rule?.name} placeholder="e.g. Weekend, Christmas season" className={field} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L t="Room type"><select name="roomTypeId" defaultValue={rule?.roomTypeId ?? ""} className={field}><option value="">All room types</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></L>
            <L t="Price per night (₱)"><input name="ratePesos" type="number" step="0.01" min="1" required defaultValue={rule?.ratePesos} className={field} /></L></div>
          <div className="grid grid-cols-2 gap-3">
            <L t="From night (optional)"><input name="startDate" type="date" defaultValue={rule?.startDate} className={field} /></L>
            <L t="Until night (optional)"><input name="endDate" type="date" defaultValue={rule?.endDate} className={field} /></L></div>
          <fieldset><legend className="mb-1 text-sm font-medium">Only on these nights (none ticked = every night)</legend>
            <div className="flex flex-wrap gap-2">{DAYS.map((n, i) => <label key={n} className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-sm">
              <input type="checkbox" checked={days.includes(i)} onChange={() => toggle(i)} /> {n}</label>)}</div></fieldset>
          <L t="Priority (higher wins when rules overlap)"><input name="priority" type="number" min="0" max="999" defaultValue={rule?.priority ?? 10} className={field} /></L>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={rule?.active ?? true} /> Turned on</label>
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
            <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save"}</button></div></form></div></div>}
  </>);
}

const iso = (add: number) => new Date(Date.now() + 8 * 3600e3 + add * 86400e3).toISOString().slice(0, 10);

export function PriceCheck({ types }: { types: TypeOpt[] }) {
  const [typeId, setTypeId] = useState(types[0]?.id ?? ""); const [from, setFrom] = useState(iso(0)); const [to, setTo] = useState(iso(3));
  const [q, setQ] = useState<{ total: number; bands: { start: string; nights: number; rate: number; name: string | null }[] } | null>(null); const [err, setErr] = useState("");
  const pesos = (c: number) => "₱" + (c / 100).toLocaleString("en-PH");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setQ(null);
    const r = await call(`/api/v1/quote?from=${from}&to=${to}&roomTypeId=${typeId}`, "GET");
    if (r.ok && r.data) setQ(r.data); else setErr(r.ok ? "Choose a check-out date after the check-in date." : r.error);
  }
  return (<section className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-semibold">Check a price</h2>
    <form onSubmit={go} className="mt-3 grid gap-3 sm:grid-cols-4">
      <select value={typeId} onChange={e => setTypeId(e.target.value)} aria-label="Room type" className={`${field} sm:col-span-2`}>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} aria-label="Check-in" className={field} />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} aria-label="Check-out" className={field} />
      <button className={`${btn} sm:col-span-4 justify-center`}>Show price</button></form>
    {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}
    {q && <div className="mt-3 space-y-1 text-sm">{q.bands.map(b => <div key={b.start} className="flex justify-between"><span>{b.nights} night{b.nights === 1 ? "" : "s"} from {b.start} × {pesos(b.rate)}{b.name ? ` (${b.name})` : ""}</span><span>{pesos(b.nights * b.rate)}</span></div>)}
      <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold"><span>Room total (before taxes and fees)</span><span>{pesos(q.total)}</span></div></div>}
  </section>);
}