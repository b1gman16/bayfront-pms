"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, KeyRound, X } from "lucide-react";
import { call, field, btn } from "./api";

const ROLES: [string, string][] = [["OWNER", "Owner / Administrator"], ["MANAGER", "Manager"], ["FRONT_DESK", "Front Desk"], ["HOUSEKEEPING", "Housekeeping"], ["CASHIER", "Cashier / Accounting"]];
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (<div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>{children}</div></div>);
}

function Reveal({ name, pw, onDone }: { name: string; pw: string; onDone: () => void }) {
  return (<div className="space-y-3">
    <p className="text-sm">Temporary password for <b>{name}</b>:</p>
    <input readOnly value={pw} onFocus={e => e.currentTarget.select()} aria-label="Temporary password" className={`${field} font-mono text-lg tracking-wider`} />
    <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">Copy or write this down now. It is shown only once and can't be looked up later. Ask them to sign in and change it under <b>Account → Change password</b>.</p>
    <div className="flex justify-end"><button onClick={onDone} className={btn}>I've saved it</button></div></div>);
}

export function AddStaff({ isOwner }: { isOwner: boolean }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<{ name: string; pw: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const r = await call("/api/v1/users", "POST", { name: f.get("name"), email: f.get("email"), role: f.get("role") });
    setBusy(false);
    r.ok ? setShown({ name: String(f.get("name")), pw: r.data.tempPassword }) : setErr(r.error);
  }
  const close = () => { setOpen(false); setShown(null); setErr(""); router.refresh(); };
  return (<>
    <button onClick={() => setOpen(true)} className={`${btn} gap-1.5`}><Plus size={16} /> Add staff</button>
    {open && <Modal title="Add staff member" onClose={close}>
      {shown ? <Reveal name={shown.name} pw={shown.pw} onDone={close} /> :
        <form onSubmit={submit} className="space-y-3">
          <L t="Full name"><input name="name" required autoFocus className={field} /></L>
          <L t="Email (used to sign in)"><input name="email" type="email" required className={field} /></L>
          <L t="Role"><select name="role" defaultValue="FRONT_DESK" className={field}>{ROLES.filter(([v]) => isOwner || v !== "OWNER").map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></L>
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={close} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
            <button disabled={busy} className={btn}>{busy ? "Creating…" : "Create account"}</button></div></form>}
    </Modal>}</>);
}

export function EditStaff({ user, isOwner, self }: { user: { id: string; name: string; role: string; active: boolean }; isOwner: boolean; self: boolean }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const r = await call(`/api/v1/users/${user.id}`, "PATCH", { name: f.get("name"), role: f.get("role") ?? user.role, active: self ? user.active : f.get("active") === "on" });
    setBusy(false); if (r.ok) { setOpen(false); router.refresh(); } else setErr(r.error);
  }
  return (<>
    <button onClick={() => setOpen(true)} aria-label={`Edit ${user.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
    {open && <Modal title={`Edit ${user.name}`} onClose={() => setOpen(false)}>
      <form onSubmit={submit} className="space-y-3">
        <L t="Full name"><input name="name" required defaultValue={user.name} className={field} /></L>
        <L t="Role"><select name="role" defaultValue={user.role} disabled={self} className={field}>{ROLES.filter(([v]) => isOwner || v !== "OWNER").map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></L>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={user.active} disabled={self} /> Account active (can sign in)</label>
        {self && <p className="text-xs text-slate-500">You can't change your own role or disable your own account.</p>}
        {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
          <button disabled={busy} className={btn}>{busy ? "Saving…" : "Save"}</button></div></form></Modal>}</>);
}

export function ResetPassword({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    if (!window.confirm(`Reset ${name}'s password? Their current password will stop working immediately.`)) return;
    setBusy(true); setErr(""); const r = await call(`/api/v1/users/${id}/reset-password`, "POST"); setBusy(false);
    if (r.ok) { setPw(r.data.tempPassword); setOpen(true); } else { setErr(r.error); setOpen(true); }
  }
  return (<>
    <button onClick={go} disabled={busy} aria-label={`Reset password for ${name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><KeyRound size={15} /></button>
    {open && <Modal title="Reset password" onClose={() => { setOpen(false); setPw(""); setErr(""); }}>
      {pw ? <Reveal name={name} pw={pw} onDone={() => { setOpen(false); setPw(""); }} /> : <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{err}</p>}</Modal>}</>);
}

export function ChangePassword() {
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setMsg(""); setErr("");
    if (f.get("next") !== f.get("again")) { setErr("The new passwords don't match."); return; }
    setBusy(true); const r = await call("/api/v1/account/password", "POST", { current: f.get("current"), next: f.get("next") }); setBusy(false);
    if (r.ok) { setMsg("Password changed."); form.reset(); } else setErr(r.error);
  }
  return (<form onSubmit={submit} className="max-w-sm space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-semibold">Change password</h2>
    <L t="Current password"><input name="current" type="password" required autoComplete="current-password" className={field} /></L>
    <L t="New password (at least 8 characters)"><input name="next" type="password" required minLength={8} autoComplete="new-password" className={field} /></L>
    <L t="New password again"><input name="again" type="password" required minLength={8} autoComplete="new-password" className={field} /></L>
    {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
    {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}
    <button disabled={busy} className={btn}>{busy ? "Saving…" : "Change password"}</button></form>);
}