"use client";
import { useEffect, useState } from "react";
// Honest status only: this shows connectivity; the offline write queue is NOT built yet.
export default function ConnectionBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    setOnline(navigator.onLine);
    addEventListener("online", up); addEventListener("offline", down);
    return () => { removeEventListener("online", up); removeEventListener("offline", down); };
  }, []);
  return online
    ? <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">ONLINE</span>
    : <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">OFFLINE: new changes cannot be saved until connection returns</span>;
}
