"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const attendanceHistory = [
  { id: 1, date: "April 12, 2024", subject: "Data Structures", status: "Present", slot: "10:00 AM - 11:30 AM", room: "LT-01" },
  { id: 2, date: "April 12, 2024", subject: "Operating Systems", status: "Present", slot: "11:30 AM - 1:00 PM", room: "CS-LAB" },
  { id: 3, date: "April 11, 2024", subject: "Discrete Math", status: "Absent", slot: "9:00 AM - 10:00 AM", room: "LT-04" },
  { id: 4, date: "April 11, 2024", subject: "Data Structures", status: "Present", slot: "10:00 AM - 11:30 AM", room: "LT-01" },
  { id: 5, date: "April 10, 2024", subject: "Microprocessors", status: "Present", slot: "2:00 PM - 3:30 PM", room: "EC-08" },
  { id: 6, date: "April 10, 2024", subject: "Operating Systems", status: "Present", slot: "3:30 PM - 5:00 PM", room: "CS-LAB" },
];

export default function StudentHistoryPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");

  const subjects = useMemo(() => {
    return ["All Subjects", ...Array.from(new Set(attendanceHistory.map(h => h.subject)))];
  }, []);

  const filteredHistory = useMemo(() => {
    if (selectedSubject === "All Subjects") return attendanceHistory;
    return attendanceHistory.filter(h => h.subject === selectedSubject);
  }, [selectedSubject]);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-6xl mx-auto space-y-10">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Attendance Log</h1>
                <p className="text-slate-500 font-medium tracking-tight">Track every lecture and cross-verify with your physical presence.</p>
            </div>
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        {selectedSubject}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-2xl p-1 border-slate-200">
                        {subjects.map(subject => (
                            <DropdownMenuItem 
                                key={subject} 
                                onClick={() => setSelectedSubject(subject)}
                                className={cn(
                                    "rounded-xl font-bold py-3 transition-colors",
                                    selectedSubject === subject ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {subject}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>
        </header>

        {/* Calendar Strip (Visual Placeholder) */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[9, 10, 11, 12, 13, 14, 15].map((day) => (
                <div 
                    key={day} 
                    className={cn(
                        "flex flex-col items-center justify-center min-w-[70px] h-24 rounded-3xl border transition-all cursor-pointer shadow-sm",
                        day === 12 
                        ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-200" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                    )}
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">April</span>
                    <span className="text-xl font-black">{day}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1", day === 11 ? "bg-red-400" : (day === 13 ? "bg-slate-200" : "bg-blue-300"))} />
                </div>
            ))}
        </div>

        {/* History List */}
        <div className="space-y-4">
            {filteredHistory.map((item, i) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="p-4 border-slate-100 bg-white rounded-3xl flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                item.status === 'Present' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                                {item.status === 'Present' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 leading-none">{item.subject}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.slot}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {item.room}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                             <span className="text-xs font-bold text-slate-900">{item.date}</span>
                             <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                 item.status === 'Present' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                             )}>
                                 {item.status}
                             </span>
                        </div>
                    </Card>
                </motion.div>
            ))}

            {filteredHistory.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold">No logs found for this subject.</p>
                </div>
            )}
        </div>

        {/* Empty State / Bottom Info */}
        <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-400 italic">"Showing logs for the current academic month"</p>
        </div>
      </div>
    </PageTransition>
  );
}
