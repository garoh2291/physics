"use client";

import { useAdminSidebar } from "./admin-sidebar-context";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const { isSidebarOpen } = useAdminSidebar();

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "md:ml-64" : "md:ml-16"
      }`}
    >
      {children}
    </div>
  );
}
