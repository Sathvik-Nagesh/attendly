"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Clock, BookOpen, User, MapPin, Calendar, Bell, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WEEKLY_SCHEDULE: any = {
  "Monday": [
    { time: "09:00 AM", subject: "Advanced Calculus", teacher: "Prof. Michael", room: "LT-101", color: "blue" },
    { time: "11:00 AM", subject: "Quantum Physics", teacher: "Dr. Sarah", room: "Lab-4", color: "indigo" },
    { time: "02:00 PM", subject: "Digital Logic", teacher: "Prof. James", room: "LT-204", color: "rose" },
  ],
  "Tuesday": [
    { time: "10:00 AM", subject: "Data Structures", teacher: "Prof. Amit", room: "CS-Lab 1", color: "emerald" },
    { time: "01:00 PM", subject: "Economics", teacher: "Mrs. Megha", room: "LT-102", color: "amber" },
  ],
  "Wednesday": [
    { time: "09:00 AM", subject: "Advanced Calculus", teacher: "Prof. Michael", room: "LT-101", color: "blue" },
    { time: "11:00 AM", subject: "Workshop", teacher: "Mr. Khanna", room: "Mech-W1", color: "slate" },
  ],
};

interface TimetableProps {
    isParentView?: boolean;
    isTeacherView?: boolean;
}

export default function StudentTimetable({ isParentView = false, isTeacherView = false }: TimetableProps) {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const handleImportCSV = (e: any) => {
    const file = e.target.files[0];
    if (file) {
        toast.promise(new Promise(r => setTimeout(r, 1500)), {
            loading: 'Analyzing timetable CSV...',
            success: 'Timetable synchronized successfully!',
            error: 'Failed to parse CSV'
        });
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title={isParentView ? "Child's Academic Timetable" : (isTeacherView ? "Class Timetable Management" : "My Academic Timetable")} />
        
        <div className="flex-1 py-8 space-y-8">
             {/* Weekly Navigation & Actions */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm",
                                selectedDay === day 
                                ? "bg-slate-900 text-white border-slate-900" 
                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                 </div>

                 {isTeacherView && (
                    <div className="flex items-center gap-3">
                        <label className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all cursor-pointer">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Import Schedule (CSV)
                            <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
                        </label>
                    </div>
                 )}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Schedule Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDay}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                        >
                            {(WEEKLY_SCHEDULE[selectedDay] || []).map((slot: any, i: number) => (
                                <Card key={i} className="p-6 border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", {
                                        "bg-blue-500": slot.color === 'blue',
                                        "bg-indigo-500": slot.color === 'indigo',
                                        "bg-rose-500": slot.color === 'rose',
                                        "bg-emerald-500": slot.color === 'emerald',
                                        "bg-amber-500": slot.color === 'amber',
                                        "bg-slate-500": slot.color === 'slate',
                                    })} />
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[100px]">
                                                <Clock className="w-4 h-4 text-slate-400 mb-1" />
                                                <span className="text-xs font-bold text-slate-900">{slot.time}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{slot.subject}</h3>
                                                <div className="flex items-center gap-4 mt-1.5 font-medium text-slate-400 text-xs text-slate-400/80">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5" />
                                                        {slot.teacher}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {slot.room}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {!isParentView && !isTeacherView && (
                                            <Button variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 text-xs font-bold">
                                                Notes & Materials
                                            </Button>
                                        )}
                                        {isTeacherView && (
                                            <Button variant="ghost" size="sm" className="h-9 rounded-lg text-rose-500 font-bold hover:bg-rose-50">
                                                Reschedule
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {(!WEEKLY_SCHEDULE[selectedDay] || WEEKLY_SCHEDULE[selectedDay].length === 0) && (
                                <div className="py-20 text-center text-slate-400 italic font-medium">
                                    No lectures scheduled for {selectedDay}.
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sidebar context */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-100 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden ring-4 ring-slate-100/50">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Next Exam</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Upcoming Internal Test</p>
                            
                            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-blue-400">Digital Systems</span>
                                    <span className="text-[9px] font-bold bg-rose-500 px-2.5 py-1 rounded-lg">3 Days Left</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-bold">April 18, 2026</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-slate-100 rounded-[2rem] bg-white shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-amber-500" />
                            Academic Alerts
                        </h3>
                        <div className="space-y-4">
                            <AlertItem title="Semester Results Live" time="2 hours ago" color="emerald" />
                            <AlertItem title="Practical Hall Tickets" time="Yesterday" color="blue" />
                            <AlertItem title="Holiday: Ram Navami" time="Tomorrow" color="amber" />
                        </div>
                    </Card>
                </div>
             </div>
        </div>
      </div>
    </PageTransition>
  );
}

function AlertItem({ title, time, color }: any) {
    return (
        <div className="flex gap-3 items-start group cursor-pointer">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", {
                "bg-emerald-500": color === 'emerald',
                "bg-blue-500": color === 'blue',
                "bg-amber-500": color === 'amber',
            })} />
            <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight">{title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
            </div>
        </div>
    );
}
