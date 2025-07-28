"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BarChart3,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "โพสต์",
    href: "/dashboard/posts",
    icon: FileText,
  },
  {
    title: "สถิติ",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "การตั้งค่า",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed left-0 top-0 z-30 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 transition-transform duration-200 md:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-lg gradient-text">Blog CMS</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                    onClick={() => setIsCollapsed(true)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4 mr-3" />
            ออกจากระบบ
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-40 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Content Spacer */}
      <div className="w-64 flex-shrink-0 hidden md:block" />
    </>
  );
}
