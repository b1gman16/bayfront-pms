"use client";
export function PrintReportButton() {
  return <button onClick={() => window.print()} className="no-print rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm hover:bg-slate-50">Print / save as PDF</button>;
}