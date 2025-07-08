"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MessageSquare,
  Plus,
  Menu,
  X,
  Tag,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminSidebar } from "./admin-sidebar-context";

export function AdminNav() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAdminSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/admin",
      label: "Վահանակ",
      icon: BookOpen,
    },
    {
      href: "/admin/exercises",
      label: "Վարժություններ",
      icon: BookOpen,
    },
    {
      href: "/admin/exercises/create",
      label: "Ստեղծել վարժություն",
      icon: Plus,
    },
    {
      href: "/admin/courses",
      label: "Թեմաներ",
      icon: GraduationCap,
    },
    {
      href: "/admin/tags",
      label: "Պիտակներ",
      icon: Tag,
    },
    {
      href: "/admin/solutions",
      label: "Լուծումներ",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div
          className={`fixed left-0 top-0 h-full bg-white border-r shadow-sm z-40 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "w-64" : "w-16"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {isSidebarOpen && (
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={`w-full justify-start ${
                    isSidebarOpen ? "px-3" : "px-2"
                  }`}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {isSidebarOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        {/* Add margin to main content so it's not hidden under the fixed header */}
        <div className="h-16" />
      </div>
    </>
  );
}
