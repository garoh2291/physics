import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Only students can access dashboard
  if (session.user.role !== "STUDENT") {
    redirect("/admin");
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
