"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: [string, string][] = [["/settings", "Staff accounts"], ["/settings/billing", "Taxes & fees"]];

export default function SettingsTabs() {
  const path = usePathname();
  return (<nav className="flex gap-1 border-b border-slate-200" aria-label="Settings">{TABS.map(([href, label]) => (
    <Link key={href} href={href} aria-current={path === href ? "page" : undefined}
      className={`-mb-px border-b-2 px-4 py-2 text-sm ${path === href ? "border-brand font-medium text-brand" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{label}</Link>))}</nav>);
}