const tone: Record<string, string> = {
  CHECKED_IN: "bg-emerald-50 text-emerald-700", CONFIRMED: "bg-amber-50 text-amber-700", PENDING: "bg-amber-50 text-amber-700",
  CHECKED_OUT: "bg-slate-100 text-slate-600", CANCELLED: "bg-red-50 text-red-700", NO_SHOW: "bg-red-50 text-red-700",
  AVAILABLE: "bg-emerald-50 text-emerald-700", CLEAN: "bg-emerald-50 text-emerald-700", INSPECTED: "bg-emerald-50 text-emerald-700",
  RESERVED: "bg-amber-50 text-amber-700", OCCUPIED: "bg-blue-50 text-blue-700", DIRTY: "bg-orange-50 text-orange-700",
  CLEANING: "bg-orange-50 text-orange-700", MAINTENANCE: "bg-red-50 text-red-700", OUT_OF_ORDER: "bg-red-50 text-red-700" };
const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, c => c.toUpperCase());
export default function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[status] ?? "bg-slate-100 text-slate-600"}`}>{label(status)}</span>;
}