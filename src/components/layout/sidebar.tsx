"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Bell,
  GraduationCap,
  Settings,
  SearchCode,
  Activity,
  RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campus Pulse", href: "/pulse", icon: Activity },
  { name: "Attendance", href: "/attendance", icon: CheckCircle },
  { name: "Students", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: GraduationCap },
  { name: "Promotion Center", href: "/promotion", icon: RefreshCcw },
  { name: "Pattern Audit", href: "/audit", icon: SearchCode },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-sm z-50 flex flex-col">
      <div className="flex items-center h-16 px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          Attendly
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        {sidebarLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors outline-none",
                isActive
                  ? "text-blue-700 bg-blue-50/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-blue-50 rounded-xl border border-blue-100/50"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <link.icon className={cn("w-5 h-5 z-10", isActive ? "text-blue-600" : "text-slate-400")} />
              <span className="z-10">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors outline-none"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
