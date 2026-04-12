"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Command, 
  Search, 
  Users, 
  CheckCircle, 
  Activity, 
  Settings, 
  GraduationCap, 
  SearchCode,
  ArrowRight,
  Sparkles,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-100"
          >
            <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                autoFocus
                placeholder="Search anything... (Students, Batches, Reports)"
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-400 tracking-widest border border-slate-200">
                ESC
              </div>
            </div>

            <div className="p-2 space-y-1">
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</div>
              
              <CommandItem 
                icon={LayoutGridIcon} 
                label="Dashboard Overview" 
                shortcut="G + D"
                onClick={() => navigate("/dashboard")}
              />
              <CommandItem 
                icon={CheckCircle} 
                label="Mark Attendance" 
                shortcut="G + A"
                onClick={() => navigate("/attendance")}
              />
              <CommandItem 
                icon={Users} 
                label="Manage Students" 
                shortcut="G + S"
                onClick={() => navigate("/students")}
              />
              <CommandItem 
                icon={GraduationCap} 
                label="Class & Batch Center" 
                onClick={() => navigate("/classes")}
              />

              <div className="px-4 py-2 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</div>
              <CommandItem 
                icon={Download} 
                label="Export Defaulter List" 
                onClick={() => {
                  setOpen(false);
                  // Trigger simulation
                }}
              />
              <CommandItem 
                icon={Sparkles} 
                label="Identify At-Risk Students" 
                onClick={() => navigate("/audit")}
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="p-1 bg-white border border-slate-200 rounded">↑</span>
                        <span className="p-1 bg-white border border-slate-200 rounded">↓</span>
                        NAVIGATE
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="p-1 px-1.5 bg-white border border-slate-200 rounded">↵</span>
                        SELECT
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <Activity className="w-3 h-3" />
                    BETA
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ icon: Icon, label, shortcut, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors group text-left outline-none focus:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
      </div>
      {shortcut && (
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400">{shortcut}</span>
      )}
    </button>
  );
}

function LayoutGridIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}
