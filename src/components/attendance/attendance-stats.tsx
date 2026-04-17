"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
  total: number;
  absent: number;
  od: number;
  onMarkAllPresent: () => void;
}

export function AttendanceStats({ total, absent, od, onMarkAllPresent }: AttendanceStatsProps) {
  const isAllPresent = absent === 0;
  const presentCount = total - absent - od;

  return (
    <div className="flex items-center justify-between py-4 px-1 mb-2">
      <div className="flex items-center gap-4">
        <div className={cn(
          "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 flex items-center gap-2",
          isAllPresent ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
        )}>
          {isAllPresent ? (
            <><CheckCircle2 className="w-4 h-4" /> All Present</>
          ) : (
            <><AlertCircle className="w-4 h-4" /> {absent} Absent</>
          )}
        </div>
        {!isAllPresent && (
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> {presentCount} Present
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" /> {od} OD
            </span>
          </div>
        )}
      </div>

      {!isAllPresent && (
        <button 
          onClick={onMarkAllPresent} 
          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 hover:bg-blue-50 rounded-xl"
        >
          Mark all present
        </button>
      )}
    </div>
  );
}
