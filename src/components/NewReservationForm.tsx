"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

type Type = { id: string; name: string; ratePesos: number; maxOccupancy: number };
type G = { id: string; fullName: string; phone: string | null };
const iso = (add: number) => new Date(Date.now() + 8 * 3600e3 + add * 86400e3).toISOString().slice(0, 10);
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;

export default function NewReservationForm({ types }: { types: Type[] }) {
  const router = useRouter();
  const [guest, setGuest] = useState<G | null>(null); const [q, setQ] = useState(""); const [found, setFound] = useState<G[]>([]); const [isNew, setIsNew] = useState(false);
  const [from, setFrom] = useState(iso(0)); const [to, setTo] = useState(iso(1)); const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]); const [roomId, setRoomId] = useState("");
  const [now, setNow] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  useEffect(() => { if (q.trim().length < 2) { setFound([]); return; }
    const t = setTimeout(async () => { const r = await call(`/api/v1/guests?q=${encodeURIComponent(q)}`, "GET"); if (r.ok) setFound(r.data); }, 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setRoomId(""); if (!typeId || to <= from) { setRooms([]); return; }
    call(`/api/v1/availability?from=${from}&to=${to}&roomTypeId=${typeId}`, "GET").then(r => setRooms(r.ok ? r.data : [])); }, [from, to, typeId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); const f = new FormData(e.currentTarget); setBusy(true);
    let guestId = guest?.id;
    if (!guestId) {
      if (!isNew) { setErr("Choose a guest or add a new one."); setBusy(false); return; }
      const g = await call("/api/v1/guests", "POST", { fullName: f.get("fullName"), phone: f.get("phone") || undefined, email: f.get("email") || undefined, nationality: f.get("nationality") || undefined });
      if (!g.ok) { setErr(g.error); setBusy(false); return; } guestId = g.data.id;
    }
    const r = await call("/api/v1/reservations", "POST", { guestId, roomTypeId: typeId, roomId: roomId || undefined, checkIn: from, checkOut: to,
      adults: Number(f.get("adults")), children: Number(f.get("children")), source: f.get("source"), specialRequests: f.get("requests") || undefined });
    if (!r.ok) { setErr(r.error); setBusy(false); return; }
    if (now) {
      if (!roomId) { setErr(`Reservation ${r.data.code} saved, but a room is needed to check in. Assign one on the Front desk page.`); setBusy(false); return; }
      const c = await call(`/api/v1/reservations/${r.data.id}/check-in`, "POST", { version: r.data.version });
      if (!c.ok) { setErr(`Reservation ${r.data.code} saved, but check-in failed: ${c.error}`); setBusy(false); return; }
    }
    router.push(now ? "/front-desk" : "/reservations");
  }
  const t = types.find(x => x.id === typeId);
  return (<form onSubmit={submit} className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <fieldset className="space-y-2"><legend className="mb-1 font-semibold">Guest</legend>
      {guest ? <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm"><span><b>{guest.fullName}</b> {guest.phone}</span><button type="button" onClick={() => setGuest(null)} className="text-brand">Change</button></div>
        : isNew ? <div className="grid gap-3 sm:grid-cols-2">
            <L t="Full name"><input name="fullName" required className={field} /></L><L t="Phone"><input name="phone" className={field} /></L>
            <L t="Email"><input name="email" type="email" className={field} /></L><L t="Nationality"><input name="nationality" defaultValue="Filipino" className={field} /></L>
            <button type="button" onClick={() => setIsNew(false)} className="text-left text-sm text-brand">Search existing guests instead</button></div>
        : <><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, phone or email…" aria-label="Search guests" className={field} />
            {found.length > 0 && <ul className="rounded-md border border-slate-200">{found.map(g => <li key={g.id}><button type="button" onClick={() => { setGuest(g); setQ(""); setFound([]); }} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50">{g.fullName} <span className="text-slate-500">{g.phone}</span></button></li>)}</ul>}
            <button type="button" onClick={() => setIsNew(true)} className="text-sm text-brand">+ New guest</button></>}
    </fieldset>
    <div className="grid gap-3 sm:grid-cols-3">
      <L t="Check-in"><input type="date" required value={from} onChange={e => setFrom(e.target.value)} className={field} /></L>
      <L t="Check-out"><input type="date" required value={to} min={from} onChange={e => setTo(e.target.value)} className={field} /></L>
      <L t="Room type"><select value={typeId} onChange={e => setTypeId(e.target.value)} className={field}>{types.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></L></div>
    {to <= from && <p className="text-sm text-red-600">Check-out must be after check-in.</p>}
    <L t={`Room (${rooms.length} available)`}><select value={roomId} onChange={e => setRoomId(e.target.value)} className={field}>
      <option value="">Assign later</option>{rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}</select></L>
    {rooms.length === 0 && to > from && <p className="text-sm text-amber-700">No {t?.name} is free for these dates. Try other dates or another type.</p>}
    <div className="grid gap-3 sm:grid-cols-3">
      <L t="Adults"><input name="adults" type="number" min={1} defaultValue={2} required className={field} /></L>
      <L t="Children"><input name="children" type="number" min={0} defaultValue={0} className={field} /></L>
      <L t="Booking source"><select name="source" className={field}>{["WALK_IN", "PHONE", "FACEBOOK", "WEBSITE", "AGODA", "BOOKING_COM", "OTHER"].map(s => <option key={s}>{s}</option>)}</select></L></div>
    <L t="Special requests"><textarea name="requests" rows={2} className={field} /></L>
    {t && to > from && <p className="text-sm text-slate-600">Rate: ₱{t.ratePesos.toLocaleString("en-PH")} per night, {Math.round((+new Date(to) - +new Date(from)) / 864e5)} night(s). Max {t.maxOccupancy} guests.</p>}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={now} onChange={e => setNow(e.target.checked)} /> Walk-in: check in now</label>
    {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
    <button disabled={busy || to <= from} className={btn}>{busy ? "Saving…" : now ? "Save and check in" : "Save reservation"}</button>
  </form>);
}