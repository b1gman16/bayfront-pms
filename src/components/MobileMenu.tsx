"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { NAV } from "./nav";
import { can, Role } from "@/server/domain/permissions";

export default function MobileMenu({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);   // close after choosing a page
  return (<div className="md:hidden">
    <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="rounded-md p-2 text-slate-600 hover:bg-slate-100"><Menu size={22} /></button>
    {open && (<div className="fixed inset-0 z-40 flex" onKeyDown={e => e.key === "Escape" && setOpen(false)}>
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
      <nav aria-label="Main" className="relative z-10 h-full w-72 max-w-[85vw] overflow-y-auto bg-navy-900 px-3 py-5">
        <div className="mb-6 flex items-start justify-between pl-2"><Logo />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded p-2 text-slate-300 hover:bg-navy-700"><X size={20} /></button></div>
        <div className="space-y-1">{NAV.filter(n => can(role, n.perm)).map(n => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (<Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-3 text-base ${active ? "bg-brand text-white" : "text-slate-300 hover:bg-navy-700"}`}>
            <n.icon size={20} aria-hidden /> {n.label}</Link>);
        })}</div>
      </nav></div>)}
  </div>);
}