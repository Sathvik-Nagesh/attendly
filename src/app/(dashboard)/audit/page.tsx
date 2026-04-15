"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { AlertTriangle, UserX, Clock, Calendar, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { academicService } from "@/services/academic";

export default function ProxyAuditPage() {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    academicService.getAttendanceAnomalies()
        .then(data => {
            setAnomalies(data || []);
            setLoading(false);
        })
        .catch(() => setLoading(false));
  }, []);

  if (loading) return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Executing Forensic Scan</p>
      </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Institutional Forensic Audit" />
        
        <div className="flex-1 py-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] flex items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                 <AlertTriangle className="w-32 h-32 text-amber-900" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
               <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-amber-900 text-lg font-black tracking-tight mb-2 uppercase">Behavioral Anomaly Detection Active</h3>
              <p className="text-amber-800/70 text-sm font-bold leading-relaxed max-w-2xl">
                The Attendly heuristic engine is currently scanning trail-run logs for "Proxy Presence" and "Early Departures." Identified patterns are flagged for HOD intervention.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Pattern A</p>
                  <p className="text-xs text-amber-800 font-bold leading-relaxed">
                    "Morning Ghosts": Identifying students who habitually skip Period 1 but attend later lectures.
                  </p>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">Pattern B</p>
                  <p className="text-xs text-amber-800 font-bold leading-relaxed">
                    "Lunchtime Leavers": Flagging students present early but absent for post-break sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
                {anomalies.map((item, idx) => (
                  <motion.div
                    key={`${item.student_id}-${item.pattern_type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-8 border-slate-100 shadow-sm rounded-[2rem] bg-white hover:border-blue-200 transition-all group overflow-hidden relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-black text-xl border border-slate-100 shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {item.student_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{item.student_name}</h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{item.roll_number}</p>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 lg:px-10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Forensic Pattern</p>
                              <p className="text-sm font-bold text-slate-800">{item.pattern_type}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Occurrences</p>
                              <p className="text-sm font-bold text-slate-800">{item.hit_count} Sessions Tracked</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                              item.risk_level === 'High' 
                                ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50' 
                                : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50'
                          )}>
                            {item.risk_level} Attention
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {anomalies.length === 0 && (
            <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                <UserX className="w-10 h-10" />
              </div>
              <p className="text-slate-900 font-black text-xl tracking-tight">System Integrity: 100%</p>
              <p className="text-slate-400 font-bold text-sm mt-2 uppercase tracking-tight">No suspicious behavioral patterns detected in trial logs.</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
