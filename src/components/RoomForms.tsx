"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";

export type TypeRow = { id: string; name: string; ratePesos: number; maxOccupancy: number; description: string; active: boolean };
export type RoomRow = { id: string; number: string; roomTypeId: string; floor: string; maxOccupancy: number; amenities: string; notes: string; status: string };

const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const primary = "inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white hover:opacity-90";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (<div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onKeyDown={e => e.key === "Escape" && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
      {children}</div></div>);
}

function useSave(url: string, method: "POST" | "PATCH", onDone: () => void) {
  const router = useRouter();
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function save(body: unknown) {
    setBusy(true); setErr("");
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json();
      if (!res.ok) {
        const fe = j.data?.fieldErrors ?? j.details?.fieldErrors;
        setErr(fe ? Object.entries(fe).map(([k, v]) => `${k}: ${(v as string[])[0]}`).join(". ") : j.error ?? "Could not save");
        return;
      }
      if (j.warning) alert(j.warning);
      router.refresh(); onDone();
    } catch { setErr("No connection to the server. Nothing was saved."); } finally { setBusy(false); }
  }
  return { err, busy, save };
}

const Label = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm"><span className="mb-1 block font-medium">{t}</span>{children}</label>;
const Actions = ({ busy, onClose }: { busy: boolean; onClose: () => void }) => (
  <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-md px-3.5 py-2 text-sm hover:bg-slate-100">Cancel</button>
    <button disabled={busy} className={`${primary} disabled:opacity-50`}>{busy ? "Saving…" : "Save"}</button></div>);

export function RoomButton({ room, types }: { room?: RoomRow; types: TypeRow[] }) {
  const [open, setOpen] = useState(false);
  const { err, busy, save } = useSave(room ? `/api/v1/rooms/${room.id}` : "/api/v1/rooms", room ? "PATCH" : "POST", () => setOpen(false));
  const settable = ["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"];
  const locked = room?.status === "OCCUPIED";
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    save({ number: f.get("number"), roomTypeId: f.get("roomTypeId"), floor: f.get("floor"), maxOccupancy: Number(f.get("maxOccupancy")),
      amenities: String(f.get("amenities")).split(",").map(s => s.trim()).filter(Boolean), notes: f.get("notes"), status: f.get("status") || undefined });
  }
  return (<>
    {room ? <button onClick={() => setOpen(true)} aria-label={`Edit room ${room.number}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
      : <button onClick={() => setOpen(true)} className={primary}><Plus size={16} /> Add room</button>}
    {open && <Modal title={room ? `Edit room ${room.number}` : "Add room"} onClose={() => setOpen(false)}>
      <form onSubmit={submit} className="space-y-3">
        <Label t="Room number"><input name="number" required autoFocus defaultValue={room?.number} className={field} /></Label>
        <Label t="Room type"><select name="roomTypeId" required defaultValue={room?.roomTypeId ?? ""} className={field}>
          <option value="" disabled>Choose a type</option>
          {types.filter(t => t.active || t.id === room?.roomTypeId).map(t => <option key={t.id} value={t.id}>{t.name}{t.active ? "" : " (inactive)"}</option>)}</select></Label>
        <div className="grid grid-cols-2 gap-3">
          <Label t="Floor"><input name="floor" defaultValue={room?.floor} className={field} /></Label>
          <Label t="Max guests"><input name="maxOccupancy" type="number" min={1} max={20} required defaultValue={room?.maxOccupancy ?? 2} className={field} /></Label></div>
        <Label t="Amenities (separate with commas)"><input name="amenities" defaultValue={room?.amenities ?? "Aircon, WiFi"} className={field} /></Label>
        <Label t="Notes"><textarea name="notes" rows={2} defaultValue={room?.notes} className={field} /></Label>
        {room && <Label t="Status">
          <select name="status" defaultValue={settable.includes(room.status) ? room.status : ""} disabled={locked} className={field}>
            {!settable.includes(room.status) && <option value="">Keep current ({room.status.toLowerCase().replace("_", " ")})</option>}
            {settable.map(s => <option key={s} value={s}>{s.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}</option>)}</select>
          {locked && <span className="mt-1 block text-xs text-amber-700">A guest is in this room. Check them out before changing the status.</span>}</Label>}
        {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <Actions busy={busy} onClose={() => setOpen(false)} /></form></Modal>}
  </>);
}

export function TypeButton({ type }: { type?: TypeRow }) {
  const [open, setOpen] = useState(false);
  const { err, busy, save } = useSave(type ? `/api/v1/room-types/${type.id}` : "/api/v1/room-types", type ? "PATCH" : "POST", () => setOpen(false));
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    save({ name: f.get("name"), ratePesos: Number(f.get("ratePesos")), maxOccupancy: Number(f.get("maxOccupancy")),
      description: f.get("description"), active: f.get("active") === "on" });
  }
  return (<>
    {type ? <button onClick={() => setOpen(true)} aria-label={`Edit ${type.name}`} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
      : <button onClick={() => setOpen(true)} className={primary}><Plus size={16} /> Add room type</button>}
    {open && <Modal title={type ? `Edit ${type.name}` : "Add room type"} onClose={() => setOpen(false)}>
      <form onSubmit={submit} className="space-y-3">
        <Label t="Name"><input name="name" required autoFocus defaultValue={type?.name} className={field} /></Label>
        <div className="grid grid-cols-2 gap-3">
          <Label t="Rate per night (₱)"><input name="ratePesos" type="number" step="0.01" min={1} required defaultValue={type?.ratePesos} className={field} /></Label>
          <Label t="Max guests"><input name="maxOccupancy" type="number" min={1} max={20} required defaultValue={type?.maxOccupancy ?? 2} className={field} /></Label></div>
        <Label t="Description"><textarea name="description" rows={2} defaultValue={type?.description} className={field} /></Label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={type?.active ?? true} /> Active (can be booked)</label>
        {type && <p className="text-xs text-slate-500">Rate changes apply to new reservations only. Existing reservations keep the rate they were booked at.</p>}
        {err && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <Actions busy={busy} onClose={() => setOpen(false)} /></form></Modal>}
  </>);
}