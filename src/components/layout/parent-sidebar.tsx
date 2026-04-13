"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  BarChart2, 
  Bell, 
  Settings, 
  LogOut,
  Heart,
  Calendar
} from "lucide-react";

const navigation = [
  { name: "Family Hub", href: "/parent/dashboard", icon: Home },
  { name: "Progress Report", href: "/parent/marks", icon: BarChart2 },
  { name: "Attendance logs", href: "/parent/history", icon: Calendar },
  { name: "Notifications", href: "/parent/notifications", icon: Bell },
];

export function ParentSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-full fixed inset-y-0 z-50">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">Attendly</span>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
                pathname === item.href
                  ? "bg-rose-50 text-rose-600 border border-rose-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 transition-colors",
                pathname === item.href ? "text-rose-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 pt-4 space-y-4">
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] relative overflow-hidden group">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Support</p>
           <p className="text-sm font-bold text-slate-900 leading-tight">Need help contacting faculty?</p>
           <button className="mt-4 w-full py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
              Contact School
           </button>
        </div>

        <button className="flex items-center w-full px-4 py-3 text-sm font-semibold text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group">
          <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-600" />
          Logout
        </button>
      </div>
    </div>
  );
}
