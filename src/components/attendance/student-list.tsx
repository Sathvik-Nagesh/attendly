"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentListProps {
  students: any[];
  absentIds: Set<string>;
  onDutyIds: Set<string>;
  medicalIds: Set<string>;
  onToggle: (id: string, type: 'present' | 'absent' | 'od') => void;
  onMedical: (id: string) => void;
}

export function StudentList({ 
  students, 
  absentIds, 
  onDutyIds, 
  medicalIds, 
  onToggle, 
  onMedical 
}: StudentListProps) {
  if (students.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
          <Search className="w-10 h-10" />
        </div>
        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">No match found</p>
        <p className="text-sm font-bold text-slate-400 mt-2">Try a different roll number or name</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 relative">
      <AnimatePresence mode="popLayout">
        {students.map((student, i) => {
          const isAbsent = absentIds.has(student.id);
          const isOD = onDutyIds.has(student.id);
          const isMedical = medicalIds.has(student.id);

          return (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.02 }}
              key={student.id}
              className={cn(
                "group px-8 py-5 flex items-center justify-between transition-colors",
                isAbsent && "bg-red-50/40 hover:bg-red-50/60",
                isOD && "bg-blue-50/40 hover:bg-blue-50/60",
                isMedical && "bg-amber-50/40 hover:bg-amber-50/60",
                !isAbsent && !isOD && !isMedical && "hover:bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border shrink-0 shadow-sm",
                  isAbsent ? "bg-red-100 text-red-600 border-red-200" :
                    isOD ? "bg-blue-100 text-blue-600 border-blue-200" :
                    isMedical ? "bg-amber-100 text-amber-600 border-amber-200" :
                      "bg-slate-50 text-slate-600 border-slate-100 group-hover:bg-white"
                )}>
                  {student.avatar || student.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className={cn("font-bold text-base transition-colors flex items-center gap-3 truncate",
                    isAbsent ? "text-red-900" :
                      isOD ? "text-blue-900" : "text-slate-900"
                  )}>
                    {student.name}
                    {student.attendance < 75 && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                        Risk
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-1">
                    {student.roll_number || student.rollNumber}
                    <span className="text-slate-200">/</span>
                    <span className={cn(student.attendance < 75 ? "text-amber-600" : "text-slate-500")}>
                      {student.attendance}% Attendance
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => onToggle(student.id, 'present')}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                    !isAbsent && !isOD && !isMedical
                      ? "bg-white text-emerald-600 shadow-sm scale-105"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  P
                </button>
                <button
                  onClick={() => onToggle(student.id, 'absent')}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                    isAbsent
                      ? "bg-white text-red-600 shadow-sm scale-105"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  A
                </button>
                <button
                  onClick={() => onToggle(student.id, 'od')}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                    isOD
                      ? "bg-white text-blue-600 shadow-sm scale-105"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  OD
                </button>
                <button
                  onClick={() => onMedical(student.id)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                    isMedical
                      ? "bg-white text-amber-600 shadow-sm scale-105"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  ML
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
