"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { call, field, btn } from "./api";

export type RoomOption = { id: string; number: string; typeName: string; sameType: boolean };
const PROBLEMS: [string, string][] = [["AIRCON", "Air-conditioning"], ["PLUMBING", "Plumbing"], ["ELECTRICAL", "Electrical"], ["INTERNET", "Internet / Wi-Fi"],
  ["FURNITURE", "Furniture damage"], ["APPLIANCE", "Appliance"], ["OTHER", "Other"]];
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;

export default function MoveRoom({ reservationId, version, current, options, ratePesos }: {
  reservationId: string; version: number; current: string; options: RoomOption[]; ratePesos: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false); const [roomId, setRoomId] = useState(""); const [problem, setProblem] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const chosen = options.find(o => o.id === roomId);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (!window.confirm(`Move this guest from Room ${current} to Room ${chosen?.number}?`)) return;
    setBusy(true); setErr("");
    const r = await call(`/api/v1/reservations/${reservationId}/move-room`, "POST",
      { version, roomId, reason: f.get("reason"), problem: problem ? f.get("problem") : undefined });
    setBusy(false);
    if (r.ok) { setOpen(false); router.refresh(); } else setErr(r.error);
  }

  return (<>
    <button onClick={() => setOpen(true)} className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm hover:bg-slate-50">Move room</button>
    {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Move to another room" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Move from Room {current}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
        {options.length === 0 ? <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">No clean room is free for the rest of this stay. Ask housekeeping to finish a room, or change a room's status on the Rooms page.</p> :
          <form onSubmit={submit} className="space-y-3">
            <L t="Move to"><select required value={roomId} onChange={e => setRoomId(e.target.value)} className={field}>
              <option value="" disabled>Choose a room</option>
              {options.map(o => <option key={o.id} value={o.id}>Room {o.number} · {o.typeName}</option>)}</select></L>
            {chosen && !chosen.sameType && <p className="rounded bg-blue-50 p-2 text-sm text-blue-900">This is a different room type. The guest keeps the booked rate of ₱{ratePesos.toLocaleString("en-PH")} per night.</p>}
            <L t="Reason"><textarea name="reason" required minLength={3} rows={2} placeholder="e.g. Air-conditioning not cooling" className={field} /></L>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={problem} onChange={e => setProblem(e.target.checked)} /> There's a problem with Room {current}: block it and tell maintenance</label>
            {problem && <L t="What kind of problem?"><select name="problem" defaultValue="AIRCON" className={field}>{PROBLEMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></L>}
            {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
              <button disabled={busy || !roomId} className={btn}>{busy ? "Moving…" : "Move guest"}</button></div></form>}
      </div></div>}
  </>);
}