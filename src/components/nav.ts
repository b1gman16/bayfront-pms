import { LayoutDashboard, CalendarDays, CalendarRange, ArrowLeftRight, BedDouble, Users, CreditCard, Sparkles, Wrench, BarChart3, ScrollText, Settings } from "lucide-react";

export const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, perm: "reservation.view" },
  { label: "Reservations", href: "/reservations", icon: CalendarDays, perm: "reservation.view" },
  { label: "Calendar", href: "/calendar", icon: CalendarRange, perm: "reservation.view" },
  { label: "Check-in / Check-out", href: "/front-desk", icon: ArrowLeftRight, perm: "checkin" },
  { label: "Rooms", href: "/rooms", icon: BedDouble, perm: "room.view" },
  { label: "Guests", href: "/guests", icon: Users, perm: "guest.view" },
  { label: "Payments", href: "/payments", icon: CreditCard, perm: "payment.view" },
  { label: "Housekeeping", href: "/housekeeping", icon: Sparkles, perm: "housekeeping.view" },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, perm: "maintenance.report" },
  { label: "Reports", href: "/reports", icon: BarChart3, perm: "report.financial" },
  { label: "Audit log", href: "/audit", icon: ScrollText, perm: "audit.view" },
  { label: "Settings", href: "/settings", icon: Settings, perm: "user.manage" },
];