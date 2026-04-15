"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  UserRound, History, Activity, MessageSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";

interface StudentProfileProps {
  student: any;
  onClose: () => void;
}

export function StudentProfile({ student, onClose }: StudentProfileProps) {
  const [mounted, setMounted] = useState(false);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF() as any;
      const timestamp = format(new Date(), 'dd-MMM-yyyy HH:mm');

      // 1. Institutional Branding
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); 
      doc.text("STUDENT PERFORMANCE AUDIT", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Academic Record | Processed: ${timestamp}`, 105, 28, { align: "center" });

      // 2. Identity Block
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 35, 182, 40, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`Identity: ${student.name}`, 20, 48);
      doc.text(`Reg No: ${student.roll || student.roll_number || 'N/A'}`, 20, 56);
      doc.text(`Current Attendance: ${student.attendance || '85'}%`, 120, 48);
      doc.text(`Risk Status: ${parseInt(student.attendance || "85") < 75 ? 'HIGH' : 'LOW'}`, 120, 56);

      // 3. Activity Timeline (Optimized for Trial)
      const activityData = [
          ["Today, 10:00 AM", "Absent for OS Lecture", "LT-01", "MISSED"],
          ["Yesterday, 11:30 AM", "Marked Present in Maths", "CS-LAB", "PRESENT"],
          ["Oct 12, 2:00 PM", "Internal Assessment 1", "MPH", "COMPLETED"]
      ];

      doc.setFontSize(12);
      doc.text("Recent Activity Trail", 14, 85);

      (doc as any).autoTable({
          startY: 90,
          head: [["Timestamp", "Activity Description", "Location", "Resolution"]],
          body: activityData,
          theme: "grid",
          headStyles: { fillColor: [15, 23, 42] }
      });

      // 4. Verification Footer
      const finY = (doc as any).lastAutoTable.finalY + 30;
      doc.setFontSize(10);
      doc.text("FAVORABLE / UNFAVORABLE", 14, finY);
      doc.text("REGISTRAR SIGNATURE: __________________________", 14, finY + 15);

      doc.save(`Audit_Report_${student.name.replace(/\s/g, '_')}.pdf`);
      toast.success("Individual Audit PDF Generated");
    } catch (err) {
      console.error(err);
      toast.error("Audit compilation failed");
    }
  };

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!student) return null;

  const attendanceValue = parseInt(student.attendance || "85");
  const isAtRisk = attendanceValue < 75;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 font-sans">
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
          <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
          >
              <X className="w-6 h-6" />
          </button>

          <div className="w-full md:w-2/5 bg-slate-50 p-10 flex flex-col items-center justify-center space-y-6 border-r border-slate-100">
             <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white flex items-center justify-center overflow-hidden ring-8 ring-white shadow-2xl">
                   <img 
                      src={`https://i.pravatar.cc/300?u=${student.roll || student.roll_number || student.rollNumber}`} 
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
                <span className="px-4 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">{student.roll || student.roll_number || student.rollNumber}</span>
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

          <div className="flex-1 max-h-[80vh] overflow-y-auto p-10 space-y-10 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100">
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
              <Button className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100">
                <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Academic Engagement</h4>
                <div className="flex gap-1 justify-between bg-slate-50 p-2 rounded-2xl">
                    {[1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1].map((p, i) => (
                        <div key={i} className={cn("flex-1 h-10 rounded-lg", p === 1 ? 'bg-emerald-400' : 'bg-red-400')} />
                    ))}
                </div>
            </div>

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
                          "absolute -left-[30px] top-1 w-4 h-4 rounded-full border-4 border-white",
                          item.status === 'missed' ? 'bg-red-500' : item.status === 'present' ? 'bg-emerald-500' : 'bg-blue-500'
                        )} />
                        <p className="text-sm font-bold text-slate-900 leading-none">{item.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{item.time} • {item.room}</p>
                     </div>
                   ))}
                </div>
            </div>

            <div className="pt-6">
               <Button 
                onClick={handleExportPDF}
                variant="outline" 
                className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                  Generate Full Audit Report (PDF)
               </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
