"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { NAV } from "./nav";
import { can, Role } from "@/server/domain/permissions";

export default function Sidebar({ role }: { role: Role }) {
  const path = usePathname();
  return (<aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-navy-900 px-3 py-5 md:flex">
    <div className="mb-8 mt-1"><Logo /></div>
    <nav className="space-y-1" aria-label="Main">
      {NAV.filter(n => can(role, n.perm)).map(n => {
        const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
        return (<Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${active ? "bg-brand text-white" : "text-slate-300 hover:bg-navy-700"}`}>
          <n.icon size={17} aria-hidden /> {n.label}</Link>);
      })}
    </nav>
  </aside>);
}