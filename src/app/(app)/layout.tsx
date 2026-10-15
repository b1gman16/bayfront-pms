import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { can, Role } from "@/server/domain/permissions";
import { permissionForPath } from "@/server/domain/pagePermissions";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = (await getServerSession(authOptions))?.user as any;
  if (!s) redirect("/login");
  // Role and active status always come from the database, so changes apply at once.
  const u = await prisma.user.findUnique({ where: { id: s.id }, select: { name: true, role: true, active: true, mustChangePassword: true } });
  if (!u || !u.active) redirect("/login");

  const path = (await headers()).get("x-pathname") ?? "/";
  if (u.mustChangePassword && path !== "/account") redirect("/account");
  if (path === "/" && !can(u.role as Role, "reservation.view")) redirect("/housekeeping");
  const need = permissionForPath(path);
  if (need && !can(u.role as Role, need)) notFound();

  return (<>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg">Skip to content</a>
    <Sidebar role={u.role} />
    <div className="md:pl-60"><Topbar name={u.name} role={u.role} />
      <main id="main" tabIndex={-1} className="p-4 outline-none md:p-6">{children}</main></div>
  </>);
}