/**
 * Attendex — Unified Sidebar Component
 * 
 * Replaces 3 near-identical sidebar files (sidebar.tsx, student-sidebar.tsx,
 * parent-sidebar.tsx) with a single configurable component.
 * 
 * Usage:
 *   <UnifiedSidebar variant="admin" />
 *   <UnifiedSidebar variant="student" />
 *   <UnifiedSidebar variant="parent" />
 */

"use client";

import { useState, useEffect } from "react";
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
  BookOpen,
  History,
  UserRound,
  Home,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ─── Route Configurations ────────────────────────────────────

interface SidebarLink {
  name: string;
  href: string;
  icon: any;
}

const ADMIN_LINKS: SidebarLink[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campus Pulse", href: "/pulse", icon: Activity },
  { name: "Students", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: GraduationCap },
  { name: "Promotion Center", href: "/promotion", icon: RefreshCcw },
  { name: "Pattern Audit", href: "/audit", icon: SearchCode },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

const STUDENT_LINKS: SidebarLink[] = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Marks & Grades", href: "/student/marks", icon: BookOpen },
  { name: "Attendance Log", href: "/student/history", icon: History },
  { name: "My Profile", href: "/student/profile", icon: UserRound },
];

const PARENT_LINKS: SidebarLink[] = [
  { name: "Overview", href: "/parent/dashboard", icon: Home },
  { name: "Academic Standing", href: "/parent/marks", icon: BookOpen },
  { name: "Attendance History", href: "/parent/history", icon: History },
  { name: "Notifications", href: "/parent/notifications", icon: Bell },
];

const VARIANT_CONFIG = {
  admin: {
    links: [
      ...ADMIN_LINKS,
      { name: "Timetable", href: "/timetable", icon: History },
      { name: "Results & Exams", href: "/results", icon: BookOpen },
    ],
    title: "Attendex",
    subtitle: "Administration",
    showSettings: true,
    accentColor: "blue",
  },
  student: {
    links: [
      ...STUDENT_LINKS,
      { name: "My Timetable", href: "/student/timetable", icon: History },
      { name: "Exams & Results", href: "/student/marks", icon: BookOpen },
    ],
    title: "Attendex",
    subtitle: "Student Portal",
    showSettings: false,
    accentColor: "indigo",
  },
  parent: {
    links: [
      ...PARENT_LINKS,
      { name: "Child's Timetable", href: "/parent/timetable", icon: History },
      { name: "Results Portal", href: "/parent/marks", icon: BookOpen },
    ],
    title: "Attendex",
    subtitle: "Family Portal",
    showSettings: false,
    accentColor: "rose",
  },
  teacher: {
    links: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Attendance", href: "/attendance", icon: CheckCircle },
      { name: "Students", href: "/students", icon: Users },
      { name: "Classes", href: "/classes", icon: GraduationCap },
      { name: "Schedule", href: "/timetable", icon: History },
      { name: "Results", href: "/results", icon: BookOpen },
      { name: "Alerts", href: "/notifications", icon: Bell },
    ],
    title: "Attendex",
    subtitle: "Faculty Portal",
    showSettings: true,
    accentColor: "blue",
  },
} as const;

type SidebarVariant = keyof typeof VARIANT_CONFIG;

// ─── Component ───────────────────────────────────────────────

interface UnifiedSidebarProps {
  variant: SidebarVariant;
}

export function UnifiedSidebar({ variant }: UnifiedSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const config = VARIANT_CONFIG[variant];

  const accentBg = `bg-${config.accentColor}-600`;
  const activeClasses = {
    blue: { bg: "bg-blue-50", border: "border-blue-100/50", text: "text-blue-700", icon: "text-blue-600" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-100/50", text: "text-indigo-700", icon: "text-indigo-600" },
    rose: { bg: "bg-rose-50", border: "border-rose-100/50", text: "text-rose-700", icon: "text-rose-600" },
  }[config.accentColor as "blue" | "indigo" | "rose"];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 768) setIsCollapsed(true);
      else if (window.innerWidth >= 1280) setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn(
        "flex items-center h-16 border-b border-slate-100 transition-all duration-300",
        isCollapsed ? "px-3 justify-center" : "px-6"
      )}>
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg tracking-tight overflow-hidden">
          <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", accentBg)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-tight animate-in fade-in slide-in-from-left-2">
              <span>{config.title}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{config.subtitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar no-scrollbar">
        {!isCollapsed && (
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-3">
            Principal Menu
          </div>
        )}

        {config.links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 h-12 rounded-2xl text-sm font-bold transition-all outline-none",
                isActive ? `${activeClasses.text} ${activeClasses.bg} shadow-sm px-4` : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-4",
                isCollapsed && "px-0 justify-center w-12 mx-auto"
              )}
            >
              <link.icon className={cn("w-5 h-5 shrink-0 z-10", isActive ? activeClasses.icon : "text-slate-400 group-hover:text-slate-900 transition-colors")} />
              {!isCollapsed && <span className="z-10">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {config.showSettings && (
          <Link
            href="/settings"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 h-12 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all",
              isCollapsed ? "px-0 justify-center w-12 mx-auto" : "px-4"
            )}
          >
            <Settings className="w-5 h-5 text-slate-400" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        )}

        <button
          onClick={async () => {
             const { error } = await supabase.auth.signOut();
             if (error) {
                toast.error("Logout failed", { description: error.message });
             } else {
                toast.success("Signed out successfully");
                window.location.href = "/login";
             }
          }}
          className={cn(
            "flex items-center gap-3 h-12 rounded-2xl text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all",
            isCollapsed ? "px-0 justify-center w-12 mx-auto" : "px-4"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Log Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors hidden xl:flex"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-[60] p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-600 md:hidden hover:scale-110 active:scale-95 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col pt-2"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {SidebarContent}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-slate-100 flex-col transition-all duration-300 ease-in-out shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {SidebarContent}
      </aside>
    </>
  );
}
