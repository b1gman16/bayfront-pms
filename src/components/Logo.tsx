export default function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (<div className="flex flex-col items-center text-white">
    <svg viewBox="0 0 60 24" className={size === "lg" ? "h-10 w-24" : "h-6 w-14"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 16c6-12 14-12 20-2 5 8 12 8 18-2 3-4 8-5 14-1" /><path d="M8 21c8 3 16 3 24 0s14-3 20 0" opacity=".6" />
    </svg>
    <span className={`font-logo tracking-[0.18em] ${size === "lg" ? "text-xl" : "text-[11px]"}`}>BAYFRONT RESORT</span>
  </div>);
}