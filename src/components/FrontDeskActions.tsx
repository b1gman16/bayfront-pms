"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { call, field, btn } from "./api";

export function CheckInButton({ id, version, label, canOverride }: { id: string; version: number; label: string; canOverride: boolean }) {
  const router = useRouter(); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(override: boolean) {
    if (!window.confirm(`Check in ${label}?`)) return;
    setBusy(true); setErr(""); const r = await call(`/api/v1/reservations/${id}/check-in`, "POST", { version, override }); setBusy(false);
    r.ok ? router.refresh() : setErr(r.error);
  }
  return (<div className="space-y-1"><button disabled={busy} onClick={() => go(false)} className={btn}>Check in</button>
    {err && <p role="alert" className="max-w-xs text-xs text-red-700">{err}</p>}
    {err && canOverride && /not ready/.test(err) && <button onClick={() => go(true)} className="text-xs text-brand underline">Manager: check in anyway</button>}</div>);
}

export function AssignRoom({ id, roomTypeId, from, to }: { id: string; roomTypeId: string; from: string; to: string }) {
  const router = useRouter(); const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]); const [err, setErr] = useState("");
  useEffect(() => { call(`/api/v1/availability?from=${from}&to=${to}&roomTypeId=${roomTypeId}`, "GET").then(r => r.ok && setRooms(r.data)); }, [from, to, roomTypeId]);
  async function pick(roomId: string) { if (!roomId) return; const r = await call(`/api/v1/reservations/${id}/assign-room`, "POST", { roomId }); r.ok ? router.refresh() : setErr(r.error); }
  return (<div><select aria-label="Assign room" defaultValue="" onChange={e => pick(e.target.value)} className={`${field} w-40`}>
    <option value="">Assign room…</option>{rooms.map(r => <option key={r.id} value={r.id}>Room {r.number}</option>)}</select>
    {rooms.length === 0 && <p className="text-xs text-amber-700">No room free</p>}{err && <p role="alert" className="text-xs text-red-700">{err}</p>}</div>);
}