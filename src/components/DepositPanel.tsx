"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { call, field, btn, uuid } from "./api";

const METHODS = ["CASH", "GCASH", "MAYA", "CARD", "BANK_TRANSFER", "OTHER"];
const peso = (c: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(c / 100);

export default function DepositPanel({ reservationId, folioId, held, estimate, canRecord, canCharge }: {
  reservationId: string; folioId: string | null; held: number; estimate: number; canRecord: boolean; canCharge: boolean }) {
  const router = useRouter(); const key = useRef(uuid());
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, ok: string, form: HTMLFormElement) {
    setBusy(true); setErr(""); setMsg(""); const r = await fn(); setBusy(false);
    if (r.ok) { setMsg(ok); form.reset(); router.refresh(); } else setErr(r.error ?? "Failed");
  }
  function deposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    run(async () => {
      const r = await call(`/api/v1/reservations/${reservationId}/deposit`, "POST",
        { amount: Math.round(Number(f.get("amount")) * 100), method: f.get("method"), reference: f.get("reference") || undefined, idempotencyKey: key.current });
      if (r.ok) key.current = uuid();
      return r;
    }, "Deposit recorded.", form);
  }
  function fee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form);
    if (!window.confirm("Keep this amount as a cancellation fee? It is added to the bill.")) return;
    run(() => call(`/api/v1/folios/${folioId}/items`, "POST", { category: "OTHER", description: String(f.get("description")), qty: 1, unitPesos: Number(f.get("amount")) }),
      "Cancellation fee added.", form);
  }

  return (<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="font-semibold">Deposits</h2>
    <div className="text-sm"><div className="flex justify-between py-1"><span className="text-slate-500">Estimated room bill</span><span>{peso(estimate)}</span></div>
      <div className="flex justify-between py-1"><span className="text-slate-500">Deposits held</span><span className="font-medium">{peso(held)}</span></div></div>
    {canRecord && <form onSubmit={deposit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2"><input name="amount" type="number" step="0.01" min="1" required placeholder="Amount (₱)" aria-label="Deposit amount in pesos" className={field} />
        <select name="method" aria-label="Payment method" className={field}>{METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
      <input name="reference" placeholder="Reference number (GCash, card, bank)" className={field} />
      <button disabled={busy} className={btn}>Record deposit</button></form>}
    {canCharge && folioId && held > 0 && <form onSubmit={fee} className="space-y-2 rounded-lg bg-slate-50 p-3">
      <div className="text-sm font-medium">Keep part of the deposit (cancellation fee)</div>
      <div className="grid grid-cols-2 gap-2"><input name="description" required defaultValue="Cancellation fee" aria-label="Description" className={field} />
        <input name="amount" type="number" step="0.01" min="1" required placeholder="Amount (₱)" aria-label="Fee amount in pesos" className={field} /></div>
      <button disabled={busy} className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm hover:bg-slate-50">Add cancellation fee</button></form>}
    {held > 0 && <p className="text-xs text-slate-500">To give a deposit back, use <Link href={`/front-desk/${reservationId}`} className="text-brand">the bill page</Link>. Cancelling needs every peso either refunded or kept as a cancellation fee.</p>}
    {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}{err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
  </section>);
}