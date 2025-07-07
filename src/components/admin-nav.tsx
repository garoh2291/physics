"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, Plus } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

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
      href: "/admin/solutions",
      label: "Լուծումներ",
      icon: MessageSquare,
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className="whitespace-nowrap"
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
    </nav>
  );
}
