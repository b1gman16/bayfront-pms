import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = (await getServerSession(authOptions))?.user as any;
  if (!u) redirect("/login");
  return (<>
    <Sidebar role={u.role} />
    <div className="md:pl-60"><Topbar name={u.name} role={u.role} /><main className="p-6">{children}</main></div>
  </>);
}