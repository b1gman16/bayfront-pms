"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

export function PrintButton() {
  return <button onClick={() => window.print()} className="no-print rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">Print receipt</button>;
}

export function VoidButton({ itemId, label }: { itemId: string; label: string }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function go() {
    const reason = window.prompt(`Why is "${label}" being removed? (required)`);
    if (!reason || reason.trim().length < 3) return;
    const r = await call(`/api/v1/folio-items/${itemId}/void`, "POST", { reason });
    r.ok ? router.refresh() : setErr(r.error);
  }
  return <span><button onClick={go} className="text-xs text-red-600 hover:underline">Void</button>{err && <span role="alert" className="ml-2 text-xs text-red-700">{err}</span>}</span>;
}

export function RefundButton({ paymentId, maxCentavos }: { paymentId: string; maxCentavos: number }) {
  const router = useRouter(); const key = useRef(crypto.randomUUID());
  const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); const pesos = Number(f.get("amount"));
    if (!window.confirm(`Refund ₱${pesos.toLocaleString("en-PH")}? This is recorded in the audit log.`)) return;
    setBusy(true); setErr("");
    const r = await call(`/api/v1/payments/${paymentId}/refund`, "POST", { amount: Math.round(pesos * 100), reason: f.get("reason"), idempotencyKey: key.current });
    setBusy(false);
    if (r.ok) { key.current = crypto.randomUUID(); setOpen(false); router.refresh(); } else setErr(r.error);
  }
  if (!open) return <button onClick={() => setOpen(true)} className="text-xs text-red-600 hover:underline">Refund</button>;
  return (<form onSubmit={submit} className="mt-2 w-full space-y-2 rounded-md bg-slate-50 p-3">
    <div className="grid grid-cols-2 gap-2">
      <input name="amount" type="number" step="0.01" min="0.01" max={maxCentavos / 100} required defaultValue={maxCentavos / 100} aria-label="Refund amount in pesos" className={field} />
      <input name="reason" required minLength={3} placeholder="Reason" aria-label="Refund reason" className={field} /></div>
    {err && <p role="alert" className="text-xs text-red-700">{err}</p>}
    <div className="flex gap-2"><button disabled={busy} className={btn}>{busy ? "Saving…" : "Refund"}</button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-slate-100">Cancel</button></div>
  </form>);
}