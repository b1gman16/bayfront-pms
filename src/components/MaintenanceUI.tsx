"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { call, field, btn } from "./api";

const CATEGORIES: [string, string][] = [["AIRCON", "Air-conditioning"], ["PLUMBING", "Plumbing"], ["ELECTRICAL", "Electrical"], ["INTERNET", "Internet / Wi-Fi"], ["FURNITURE", "Furniture damage"], ["APPLIANCE", "Appliance"], ["OTHER", "Other"]];
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;

export function NewTicket({ rooms, canBlock }: { rooms: { id: string; number: string }[]; canBlock: boolean }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const r = await call("/api/v1/maintenance/tickets", "POST", { roomId: f.get("roomId") || undefined, area: f.get("area") || undefined, category: f.get("category"),
      description: f.get("description"), priority: f.get("priority"), blockRoom: f.get("blockRoom") === "on" });
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    if (r.data.warning) alert(r.data.warning);
    setOpen(false); router.refresh();
  }
  return (<>
    <button onClick={() => setOpen(true)} className={`${btn} gap-1.5`}><Plus size={16} /> Report problem</button>
    {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Report a problem" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Report a problem</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
        <form onSubmit={submit} className="space-y-3">
          <L t="Room"><select name="roomId" defaultValue="" className={field}><option value="">Not a room (type the area below)</option>{rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}</select></L>
          <L t="Area (if not a room)"><input name="area" placeholder="e.g. Pool, restaurant, lobby" className={field} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L t="Problem type"><select name="category" className={field}>{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></L>
            <L t="Priority"><select name="priority" defaultValue="NORMAL" className={field}>{["LOW", "NORMAL", "HIGH", "URGENT"].map(p => <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>)}</select></L></div>
          <L t="What is wrong?"><textarea name="description" required rows={3} className={field} /></L>
          {canBlock && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="blockRoom" /> Block this room so it can't be booked</label>}
          {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
            <button disabled={busy} className={btn}>{busy ? "Saving…" : "Submit"}</button></div>
        </form></div></div>}
  </>);
}

export function TicketActions({ id, status, assignedToId, staff, canManage, isAssignee }: {
  id: string; status: string; assignedToId: string; staff: { id: string; name: string }[]; canManage: boolean; isAssignee: boolean }) {
  const router = useRouter(); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [fixing, setFixing] = useState(false); const [note, setNote] = useState("");
  const isOpen = ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(status); const mayWork = canManage || isAssignee;
  async function act(action: string, extra: object = {}) {
    setBusy(true); setErr(""); const r = await call(`/api/v1/maintenance/tickets/${id}`, "PATCH", { action, ...extra }); setBusy(false);
    if (r.ok) { setFixing(false); router.refresh(); } else setErr(r.error);
  }
  const small = "rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50";
  return (<div className="space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      {canManage && isOpen && <select aria-label="Assign to" value={assignedToId} disabled={busy} onChange={e => act("ASSIGN", { assignedToId: e.target.value || null })} className={`${field} w-40`}>
        <option value="">Unassigned</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
      {isOpen && status !== "IN_PROGRESS" && mayWork && <button disabled={busy} onClick={() => act("START")} className={small}>Start work</button>}
      {isOpen && mayWork && <button disabled={busy} onClick={() => setFixing(v => !v)} className={small}>Mark resolved</button>}
      {status === "RESOLVED" && canManage && <button disabled={busy} onClick={() => act("CLOSE")} className={small}>Close</button>}
      {["RESOLVED", "CLOSED"].includes(status) && canManage && <button disabled={busy} onClick={() => act("REOPEN")} className={small}>Reopen</button>}
    </div>
    {fixing && <div className="flex gap-2"><input value={note} onChange={e => setNote(e.target.value)} placeholder="What was done to fix it?" aria-label="Resolution" className={field} />
      <button disabled={busy || !note.trim()} onClick={() => act("RESOLVE", { resolution: note })} className={btn}>Save</button></div>}
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
  </div>);
}