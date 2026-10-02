"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

type P = { id: string; version: number; status: string; checkIn: string; checkOut: string; adults: number; children: number; source: string;
  specialRequests: string; internalNotes: string; roomId: string; roomNumber: string; roomTypeId: string; today: string; canEdit: boolean; canCancel: boolean };
const SOURCES = ["WALK_IN", "PHONE", "FACEBOOK", "WEBSITE", "AGODA", "BOOKING_COM", "OTHER"];
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;

export default function ReservationEditor(p: P) {
  const router = useRouter();
  const inHouse = p.status === "CHECKED_IN"; const upcoming = ["PENDING", "CONFIRMED"].includes(p.status);
  const [from, setFrom] = useState(p.checkIn); const [to, setTo] = useState(p.checkOut); const [roomId, setRoomId] = useState(p.roomId);
  const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!upcoming || to <= from) { setRooms([]); return; }
    call(`/api/v1/availability?from=${from}&to=${to}&roomTypeId=${p.roomTypeId}&ignore=${p.id}`, "GET").then(r => setRooms(r.ok ? r.data : []));
  }, [from, to, upcoming, p.roomTypeId, p.id]);

  const currentFree = !roomId || rooms.some(r => r.id === roomId);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr(""); setMsg("");
    const r = await call(`/api/v1/reservations/${p.id}`, "PATCH", { version: p.version, checkIn: from, checkOut: to,
      adults: Number(f.get("adults")), children: Number(f.get("children")), source: f.get("source"), roomId: roomId || undefined,
      specialRequests: f.get("requests") || undefined, internalNotes: f.get("notes") || undefined });
    setBusy(false);
    if (r.ok) { setMsg("Saved."); router.refresh(); } else setErr(r.error);
  }
  async function cancel() {
    const reason = window.prompt("Reason for cancelling (required)");
    if (!reason || reason.trim().length < 3) return;
    if (!window.confirm("Cancel this reservation? This can't be undone.")) return;
    setBusy(true); setErr("");
    const r = await call(`/api/v1/reservations/${p.id}/cancel`, "POST", { version: p.version, reason });
    setBusy(false); r.ok ? router.refresh() : setErr(r.error);
  }
  async function noShow() {
    if (!window.confirm("Mark this guest as a no-show?")) return;
    setBusy(true); setErr("");
    const r = await call(`/api/v1/reservations/${p.id}/no-show`, "POST", { version: p.version });
    setBusy(false); r.ok ? router.refresh() : setErr(r.error);
  }

  return (<div className="space-y-4">
    <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold">{inHouse ? "Change stay" : "Edit reservation"}</h2>
      <fieldset disabled={!p.canEdit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <L t="Check-in"><input type="date" value={from} disabled={inHouse} required onChange={e => setFrom(e.target.value)} className={field} /></L>
          <L t="Check-out"><input type="date" value={to} min={inHouse ? p.today : from} required onChange={e => setTo(e.target.value)} className={field} /></L>
          {upcoming ? <L t="Room"><select value={roomId} onChange={e => setRoomId(e.target.value)} className={field}>
            {!roomId && <option value="">Unassigned</option>}
            {roomId && !currentFree && <option value={roomId}>Room {p.roomNumber} (not free for these dates)</option>}
            {rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}</select></L>
            : <L t="Room"><input value={`Room ${p.roomNumber}`} disabled className={field} /></L>}
        </div>
        {to <= from && <p className="text-sm text-red-600">Check-out must be after check-in.</p>}
        {upcoming && !currentFree && <p className="text-sm text-amber-700">Room {p.roomNumber} isn't free for these dates. Choose another room.</p>}
        {inHouse && <p className="text-sm text-slate-600">Changing the check-out date updates the room charge on the bill.</p>}
        <div className="grid gap-3 sm:grid-cols-3">
          <L t="Adults"><input name="adults" type="number" min={1} defaultValue={p.adults} required className={field} /></L>
          <L t="Children"><input name="children" type="number" min={0} defaultValue={p.children} className={field} /></L>
          <L t="Booking source"><select name="source" defaultValue={p.source} className={field}>{[...new Set([p.source, ...SOURCES])].map(s => <option key={s}>{s}</option>)}</select></L></div>
        <L t="Special requests"><textarea name="requests" rows={2} defaultValue={p.specialRequests} className={field} /></L>
        <L t="Internal notes (staff only)"><textarea name="notes" rows={2} defaultValue={p.internalNotes} className={field} /></L>
      </fieldset>
      {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      {msg && <p role="status" className="text-sm text-emerald-700">{msg}</p>}
      {p.canEdit && <button disabled={busy || to <= from} className={btn}>{busy ? "Saving…" : "Save changes"}</button>}
    </form>
    {upcoming && p.canCancel && <div className="flex flex-wrap gap-3">
      <button disabled={busy} onClick={cancel} className="rounded-md border border-red-300 px-3.5 py-2 text-sm text-red-700 hover:bg-red-50">Cancel reservation</button>
      {p.checkIn <= p.today && <button disabled={busy} onClick={noShow} className="rounded-md border border-slate-300 px-3.5 py-2 text-sm hover:bg-slate-50">Mark as no-show</button>}</div>}
  </div>);
}