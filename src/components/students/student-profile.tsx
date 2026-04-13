"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  UserRound,
  History,
  Activity,
  MessageSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudentProfileProps {
  student: any;
  onClose: () => void;
}

export function StudentProfile({ student, onClose }: StudentProfileProps) {
  if (!student) return null;

  const attendanceValue = parseInt(student.attendance || "85");
  const isAtRisk = attendanceValue < 75;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20"
        >
          {/* Close Button - More Prominent */}
          <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
          >
              <X className="w-6 h-6" />
          </button>

          {/* Left Side: Visuals & Identity */}
          <div className="w-full md:w-2/5 bg-slate-50 p-10 flex flex-col items-center justify-center space-y-6 border-r border-slate-100">
             <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white flex items-center justify-center overflow-hidden ring-8 ring-white shadow-2xl">
                  <img 
                      src={`https://i.pravatar.cc/300?u=${student.roll || student.rollNumber}`} 
                      alt={student.name}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg",
                  isAtRisk ? 'bg-red-500' : 'bg-emerald-500'
                )}>
                  {isAtRisk ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
             </div>

             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{student.name}</h2>
                <span className="px-4 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">{student.roll || student.rollNumber}</span>
                <p className="text-xs text-slate-400 font-bold flex items-center justify-center gap-1.5 pt-2">
                  <MapPin className="w-3 h-3" />
                  Hostel Block B, Room 402
                </p>
             </div>

             <div className="w-full pt-6 space-y-3">
                <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                   <span className={cn("text-lg font-black", isAtRisk ? 'text-red-600' : 'text-slate-900')}>{student.attendance || "85%"}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</span>
                   <span className={cn("text-[10px] font-black uppercase tracking-widest", isAtRisk ? 'text-red-500' : 'text-emerald-500')}>{isAtRisk ? "HIGH" : "LOW"}</span>
                </div>
             </div>
          </div>

          {/* Right Side: Details & History */}
          <div className="flex-1 max-h-[80vh] overflow-y-auto p-10 space-y-10 custom-scrollbar">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Performance Heatmap */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Academic Engagement</h4>
                <div className="flex gap-1 justify-between bg-slate-50 p-2 rounded-2xl">
                    {[1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1].map((p, i) => (
                        <div 
                            key={i} 
                            className={cn(
                              "flex-1 h-10 rounded-lg transition-all hover:scale-110 cursor-help",
                              p === 1 ? 'bg-emerald-400 shadow-sm shadow-emerald-100' : 'bg-red-400 shadow-sm shadow-red-100'
                            )}
                            title={p === 1 ? 'Lecture Attended' : 'Lecture Missed'}
                        />
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 font-bold text-center italic">"Historical pattern from the last 20 sessions"</p>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Activity Log</h4>
                <div className="space-y-6 relative pl-6 before:absolute before:left-[1px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                   {[
                     { title: "Absent for OS Lecture", time: "Today, 10:00 AM", status: "missed", room: "LT-01" },
                     { title: "Marked Present in Maths", time: "Yesterday, 11:30 AM", status: "present", room: "CS-LAB" },
                     { title: "Internal Assessment 1", time: "Oct 12, 2:00 PM", status: "exam", room: "MPH" }
                   ].map((item, idx) => (
                     <div key={idx} className="relative">
                        <div className={cn(
                          "absolute -left-[30px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                          item.status === 'missed' ? 'bg-red-500' : item.status === 'present' ? 'bg-emerald-500' : 'bg-blue-500'
                        )} />
                        <p className="text-sm font-bold text-slate-900 leading-none">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                            <span className="text-[10px] font-bold text-slate-500">{item.time}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-500">{item.room}</span>
                        </div>
                     </div>
                   ))}
                </div>
            </div>

            <div className="pt-6">
               <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                  Generate Full Audit Report (PDF)
               </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
