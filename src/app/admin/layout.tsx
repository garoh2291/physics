import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminLayoutWrapper } from "@/components/admin-layout-wrapper";
import { AdminSidebarProvider } from "@/components/admin-sidebar-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Only admins and superadmins can access admin pages
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <AdminSidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
      </div>
    </AdminSidebarProvider>
  );
}
