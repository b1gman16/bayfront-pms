"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

export type Staff = { id: string; name: string };
export type CardProps = { id: string; status: string; room: string; type: string; notes: string; assignedToId: string; staff: Staff[]; canManage: boolean };

export default function HousekeepingCard(p: CardProps) {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [notes, setNotes] = useState(p.notes);

  async function act(action: string, extra: object = {}) {
    setBusy(true); setErr("");
    const r = await call(`/api/v1/housekeeping/tasks/${p.id}`, "PATCH", { action, ...extra });
    setBusy(false);
    r.ok ? router.refresh() : setErr(r.error);
  }

  return (<div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-baseline justify-between"><span className="text-xl font-semibold">Room {p.room}</span><span className="text-sm text-slate-500">{p.type}</span></div>

    {p.canManage && ["DIRTY", "CLEANING"].includes(p.status) && (
      <select aria-label={`Assign Room ${p.room}`} value={p.assignedToId} disabled={busy}
        onChange={e => act("ASSIGN", { assignedToId: e.target.value || null })} className={field}>
        <option value="">Unassigned</option>
        {p.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>)}

    <div className="flex gap-2">
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Cleaning note (optional)" aria-label={`Note for Room ${p.room}`} className={field} />
      {notes !== p.notes && <button disabled={busy} onClick={() => act("NOTE", { notes })} className="shrink-0 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50">Save</button>}
    </div>

    {p.status === "DIRTY" && <button disabled={busy} onClick={() => act("START")} className={`${btn} w-full justify-center`}>Start cleaning</button>}
    {p.status === "CLEANING" && <button disabled={busy} onClick={() => act("FINISH")} className={`${btn} w-full justify-center`}>Mark clean</button>}
    {p.status === "CLEAN" && p.canManage && <button disabled={busy} onClick={() => act("INSPECT")} className={`${btn} w-full justify-center`}>Mark inspected</button>}
    {p.status === "CLEAN" && !p.canManage && <p className="text-sm text-emerald-700">Done. Waiting for supervisor inspection.</p>}
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
  </div>);
}