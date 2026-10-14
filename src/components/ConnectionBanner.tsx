"use client";
import { useEffect, useState } from "react";

/** Shows whether this device can actually reach the Bayfront server (not just whether it has Wi-Fi). */
export default function ConnectionBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let alive = true;
    let busy = false;
    async function check() {
      if (busy) return;
      busy = true;
      if (!navigator.onLine) { if (alive) setOnline(false); busy = false; return; }
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 4000);   // no answer in 4 seconds = offline
      try {
        const r = await fetch("/api/auth/csrf", { cache: "no-store", signal: ctl.signal });
        if (alive) setOnline(r.ok);
      } catch { if (alive) setOnline(false); }
      finally { clearTimeout(timer); busy = false; }
    }
    check();
    const t = setInterval(check, 10_000);
    window.addEventListener("online", check); window.addEventListener("offline", check);
    return () => { alive = false; clearInterval(t); window.removeEventListener("online", check); window.removeEventListener("offline", check); };
  }, []);

  return online
    ? <span role="status" className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">ONLINE</span>
    : <span role="status" className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
        <span className="md:hidden">OFFLINE</span>
        <span className="hidden md:inline">OFFLINE: can't reach the server. Changes won't be saved.</span></span>;
}