"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";
import { call, field, btn } from "./api";

export type RuleRow = { id: string; name: string; kind: string; type: string; amount: number; compound: boolean; active: boolean; sortOrder: number };
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;
const payload = (r: RuleRow, patch: Partial<RuleRow> = {}) => { const x = { ...r, ...patch };
  return { name: x.name, kind: x.kind, type: x.type, amount: x.amount, compound: x.compound, active: x.active, sortOrder: x.sortOrder }; };

export function ToggleRule({ rule }: { rule: RuleRow }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function go() {
    if (!window.confirm(`${rule.active ? "Turn off" : "Turn on"} "${rule.name}"? This changes how every bill is worked out.`)) return;
    const r = await call(`/api/v1/fee-rules/${rule.id}`, "PATCH", payload(rule, { active: !rule.active }));
    r.ok ? router.refresh() : setErr(r.error);
  }
  return <span><button onClick={go} className="text-sm text-brand hover:underline">{rule.active ? "Turn off" : "Turn on"}</button>{err && <span role="alert" className="ml-2 text-xs text-red-700">{err}</span>}</span>;
}

export function RuleButton({ rule, nextOrder = 10 }: { rule?: RuleRow; nextOrder?: number }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState(rule?.kind ?? "TAX"); const [type, setType] = useState(rule?.type ?? "PERCENT");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const body = { name: f.get("name"), kind, type, amount: Number(f.get("amount")), compound: kind === "TAX" && f.get("compound") === "on",
      active: f.get("active") === "on", sortOrder: Number(f.get("sortOrder")) };
    const r = rule ? await call(`/api/v1/fee-rules/${rule.id}`, "PATCH", body) : await call("/api/v1/fee-rules", "POST", body);
    setBusy(false); if (r.ok) { setOpen(false); router.refresh(); } else setErr(r.error);
  }
  return (<>
    {rule ? <button onClick={() => setOpen(true)} aria-label={`Edit ${rule.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
      : <button onClick={() => setOpen(true)} className={`${btn} gap-1.5`}><Plus size={16} /> Add rule</button>}
    {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={rule ? `Edit ${rule.name}` : "Add rule"} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{rule ? `Edit ${rule.name}` : "Add rule"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
        <form onSubmit={submit} className="space-y-3">
          <L t="Name (shown on the bill)"><input name="name" required autoFocus defaultValue={rule?.name} placeholder="e.g. VAT, Service charge, Senior discount" className={field} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L t="What is it?"><select value={kind} onChange={e => setKind(e.target.value)} className={field}>
              <option value="TAX">Tax</option><option value="FEE">Service charge / fee</option><option value="DISCOUNT">Discount</option></select></L>
            <L t="Calculated as"><select value={type} onChange={e => setType(e.target.value)} className={field}>
              <option value="PERCENT">Percent of the bill</option><option value="FIXED">Fixed amount (once per bill)</option></select></L></div>
          <div className="grid grid-cols-2 gap-3">
            <L t={type === "PERCENT" ? "Percent (%)" : "Amount (₱)"}><input name="amount" type="number" step="0.01" min="0.01" max={type === "PERCENT" ? 100 : undefined} required defaultValue={rule?.amount} className={field} /></L>
            <L t="Order (lower runs first)"><input name="sortOrder" type="number" min="0" max="999" defaultValue={rule?.sortOrder ?? nextOrder} className={field} /></L></div>
          {kind === "TAX" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="compound" defaultChecked={rule?.compound} /> Also charge this tax on the service charge</label>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={rule?.active ?? true} /> Turned on</label>
          <p className="text-xs text-slate-500">Discounts come off first, then fees are added, then taxes. Changes apply to every bill, including existing ones.</p>
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
            <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save"}</button></div></form></div></div>}
  </>);
}

export function ResortForm({ resort }: { resort: { name: string; address: string; phone: string; tin: string; footer: string } }) {
  const router = useRouter(); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr(""); setMsg("");
    const r = await call("/api/v1/settings/resort", "PUT", { name: f.get("name"), address: f.get("address"), phone: f.get("phone"), tin: f.get("tin"), footer: f.get("footer") });
    setBusy(false); if (r.ok) { setMsg("Saved."); router.refresh(); } else setErr(r.error);
  }
  return (<form onSubmit={save} className="max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-semibold">Receipt details</h2>
    <L t="Resort name"><input name="name" required defaultValue={resort.name} className={field} /></L>
    <L t="Address"><input name="address" defaultValue={resort.address} className={field} /></L>
    <div className="grid gap-3 sm:grid-cols-2"><L t="Phone"><input name="phone" defaultValue={resort.phone} className={field} /></L>
      <L t="Registration / TIN line (optional)"><input name="tin" defaultValue={resort.tin} placeholder="e.g. TIN 000-000-000-000" className={field} /></L></div>
    <L t="Message at the bottom of receipts"><input name="footer" defaultValue={resort.footer} placeholder="Thank you for staying at Bayfront Resort." className={field} /></L>
    {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
    {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}
    <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save receipt details"}</button></form>);
}