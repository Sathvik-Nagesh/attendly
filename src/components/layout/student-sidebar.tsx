"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  History,
  User,
  Settings,
  LogOut,
  Sparkles,
  PieChart
} from "lucide-react";

const navigation = [
  { name: "My Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Marks & Grades", href: "/student/marks", icon: BookOpen },
  { name: "Attendance History", href: "/student/history", icon: History },
  { name: "My Profile", href: "/student/profile", icon: User },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-full fixed inset-y-0 z-50">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">Attendex</span>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
                pathname === item.href
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-50/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-colors",
                pathname === item.href ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 pt-4 space-y-4">
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</p>
          <p className="text-sm font-bold">Good Standing</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 w-[85%] rounded-full" />
            </div>
            <span className="text-[10px] font-bold">85%</span>
          </div>
        </div>

        <button className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group">
          <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-600" />
          Logout
        </button>
      </div>
    </div>
  );
}
