"use client";
import { signOut } from "next-auth/react";
import { Search, LogOut } from "lucide-react";
import ConnectionBanner from "./ConnectionBanner";

export default function Topbar({ name, role }: { name: string; role: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (<header className="sticky top-0 z-10 flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
    <form action="/reservations" className="relative flex-1 max-w-xl">
      <Search size={16} className="absolute left-3 top-2.5 text-slate-400" aria-hidden />
      <input name="q" aria-label="Search" placeholder="Search guests, reservation codes, or room numbers…"
        className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none" />
    </form>
    <div className="ml-auto flex items-center gap-4">
      <ConnectionBanner />
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">{initials}</div>
        <div className="hidden text-sm leading-tight sm:block"><div className="font-medium">{name}</div>
          <div className="text-xs text-slate-500">{role.replace("_", " ").toLowerCase().replace(/^\w|\s\w/g, c => c.toUpperCase())}</div></div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out" aria-label="Sign out"
          className="rounded p-2 text-slate-500 hover:bg-slate-100"><LogOut size={17} /></button>
      </div>
    </div>
  </header>);
}