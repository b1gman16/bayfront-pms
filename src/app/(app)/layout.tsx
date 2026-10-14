import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = (await getServerSession(authOptions))?.user as any;
  if (!s) redirect("/login");
  // Current role and active status come from the database, so a disabled or demoted account takes effect at once.
  const u = await prisma.user.findUnique({ where: { id: s.id }, select: { name: true, role: true, active: true } });
  if (!u || !u.active) redirect("/login");
  return (<>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg">Skip to content</a>
    <Sidebar role={u.role} />
    <div className="md:pl-60"><Topbar name={u.name} role={u.role} />
      <main id="main" tabIndex={-1} className="p-4 outline-none md:p-6">{children}</main></div>
  </>);
}