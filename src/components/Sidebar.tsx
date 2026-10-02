"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, CalendarRange, ArrowLeftRight, BedDouble, Users, CreditCard, Sparkles, Wrench, BarChart3, Settings } from "lucide-react";
import Logo from "./Logo";
import { can, Role } from "@/server/domain/permissions";

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, perm: "room.view" },
  { label: "Reservations", href: "/reservations", icon: CalendarDays, perm: "reservation.view" },
  { label: "Calendar", href: "/calendar", icon: CalendarRange, perm: "reservation.view" },
  { label: "Check-in / Check-out", href: "/front-desk", icon: ArrowLeftRight, perm: "checkin" },
  { label: "Rooms", href: "/rooms", icon: BedDouble, perm: "room.view" },
  { label: "Guests", href: "/guests", icon: Users, perm: "guest.view" },
  { label: "Payments", href: "/payments", icon: CreditCard, perm: "payment.view" },
  { label: "Housekeeping", href: "/housekeeping", icon: Sparkles, perm: "housekeeping.view" },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, perm: "maintenance.report" },
  { label: "Reports", href: "/reports", icon: BarChart3, perm: "report.view" },
  { label: "Settings", href: "/settings", icon: Settings, perm: "user.manage" },
];

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