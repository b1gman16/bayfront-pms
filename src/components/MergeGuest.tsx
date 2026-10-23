"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, btn } from "./api";

export default function MergeGuest({ keepId, removeId, keepName, removeName, reservations }: {
  keepId: string; removeId: string; keepName: string; removeName: string; reservations: number }) {
  const router = useRouter();
  const [ok, setOk] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    if (!window.confirm(`Merge ${removeName} into ${keepName}? ${removeName}'s profile will be removed and this can't be undone.`)) return;
    setBusy(true); setErr("");
    const r = await call("/api/v1/guests/merge", "POST", { keepId, removeId });
    setBusy(false);
    if (r.ok) router.push(`/guests/${keepId}`); else setErr(r.error);
  }
  return (<div className="space-y-3 rounded-xl border border-red-200 bg-white p-5 shadow-sm">
    <p className="text-sm">{reservations} reservation{reservations === 1 ? "" : "s"} will move to <b>{keepName}</b>, and <b>{removeName}</b>'s profile will be removed.</p>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} /> I understand this can't be undone</label>
    {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
    <button disabled={!ok || busy} onClick={go} className={`${btn} bg-red-600`}>{busy ? "Merging…" : "Merge profiles"}</button>
  </div>);
}