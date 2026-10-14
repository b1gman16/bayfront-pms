import "./globals.css";
export const metadata = { title: "Bayfront Resort PMS" };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="bg-sand font-sans text-slate-800 antialiased">{children}</body></html>;
}