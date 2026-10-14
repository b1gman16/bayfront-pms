"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { call, field, btn } from "./api";

const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;
const ID_TYPES = ["Passport", "Driver's license", "UMID", "PhilSys ID", "Voter's ID", "Other"];

export function AddGuest() {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const r = await call("/api/v1/guests", "POST", { fullName: f.get("fullName"), phone: f.get("phone") || undefined, email: f.get("email") || undefined, nationality: f.get("nationality") || undefined });
    setBusy(false);
    if (r.ok) { setOpen(false); router.push(`/guests/${r.data.id}`); } else setErr(r.error);
  }
  return (<>
    <button onClick={() => setOpen(true)} className={`${btn} gap-1.5`}><Plus size={16} /> Add guest</button>
    {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Add guest" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Add guest</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
        <form onSubmit={submit} className="space-y-3">
          <L t="Full name"><input name="fullName" required autoFocus className={field} /></L>
          <div className="grid grid-cols-2 gap-3"><L t="Phone"><input name="phone" className={field} /></L><L t="Nationality"><input name="nationality" defaultValue="Filipino" className={field} /></L></div>
          <L t="Email"><input name="email" type="email" className={field} /></L>
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
            <button disabled={busy} className={btn}>{busy ? "Saving…" : "Add guest"}</button></div></form></div></div>}
  </>);
}

export type GuestData = { id: string; fullName: string; phone: string; email: string; address: string; nationality: string; notes: string; idType: string; idMasked: string };

export function GuestEditor({ g, canEdit }: { g: GuestData; canEdit: boolean }) {
  const router = useRouter(); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr(""); setMsg("");
    const r = await call(`/api/v1/guests/${g.id}`, "PATCH", { fullName: f.get("fullName"), phone: f.get("phone") || undefined, email: f.get("email") || undefined,
      address: f.get("address") || undefined, nationality: f.get("nationality") || undefined, notes: f.get("notes") || undefined,
      idType: f.get("idType") || undefined, idNumber: f.get("idNumber") || undefined, clearId: f.get("clearId") === "on" });
    setBusy(false);
    if (r.ok) { setMsg("Saved."); (e.target as HTMLFormElement).reset(); router.refresh(); } else setErr(r.error);
  }
  return (<form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-semibold">Guest details</h2>
    <fieldset disabled={!canEdit} className="space-y-4">
      <L t="Full name"><input name="fullName" required defaultValue={g.fullName} className={field} /></L>
      <div className="grid gap-3 sm:grid-cols-2"><L t="Phone"><input name="phone" defaultValue={g.phone} className={field} /></L><L t="Email"><input name="email" type="email" defaultValue={g.email} className={field} /></L></div>
      <div className="grid gap-3 sm:grid-cols-2"><L t="Address"><input name="address" defaultValue={g.address} className={field} /></L><L t="Nationality"><input name="nationality" defaultValue={g.nationality} className={field} /></L></div>
      <div className="space-y-2 rounded-lg bg-slate-50 p-3">
        <div className="text-sm font-medium">Identification</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <L t="ID type"><select name="idType" defaultValue={g.idType} className={field}><option value="">Not recorded</option>{ID_TYPES.map(t => <option key={t}>{t}</option>)}</select></L>
          <L t={g.idMasked ? `ID number (saved: ${g.idMasked})` : "ID number"}><input name="idNumber" autoComplete="off" placeholder={g.idMasked ? "Leave blank to keep the saved number" : ""} className={field} /></L></div>
        <p className="text-xs text-slate-500">ID numbers are stored encrypted and only the last 4 characters are ever shown. Only collect ID where the law or the resort's policy requires it.</p>
        {g.idMasked && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="clearId" /> Remove saved ID details</label>}</div>
      <L t="Notes (preferences, allergies, VIP, issues)"><textarea name="notes" rows={3} defaultValue={g.notes} className={field} /></L>
    </fieldset>
    {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
    {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}
    {canEdit && <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save changes"}</button>}
  </form>);
}