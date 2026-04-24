"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XSquare,
  Filter,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const dailyLogs = [
  { day: "Today", date: "April 13, 2024", total: "4/5", status: "Good", classes: [
    { name: "Object Oriented Design", time: "10:00 AM", status: "Present" },
    { name: "Mathematics IV", time: "11:30 AM", status: "Present" },
    { name: "Discrete Math", time: "2:00 PM", status: "Present" },
    { name: "Microprocessors", time: "3:30 PM", status: "Present" },
    { name: "Hardware Lab", time: "5:00 PM", status: "Absent" },
  ]},
  { day: "Yesterday", date: "April 12, 2024", total: "5/5", status: "Perfect", classes: [
    { name: "DCA Theory", time: "9:00 AM", status: "Present" },
    { name: "Soft Skills", time: "11:00 AM", status: "Present" },
    { name: "App Dev Lab", time: "1:00 PM", status: "Present" },
  ]},
];

export default function ParentHistoryPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-5xl mx-auto space-y-10">
        
        <Header title="Attendance History" showBack />

        {/* Weekly Engagement Chart (Decorative) */}
        <div className="grid grid-cols-7 gap-3 h-20">
            {[80, 90, 70, 85, 95, 0, 0].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full flex-1 bg-slate-50 rounded-xl relative overflow-hidden p-0.5">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${val}%` }}
                           className={cn("absolute bottom-0 left-0 right-0 rounded-lg", i === 6 ? 'bg-slate-200' : 'bg-rose-400/80')}
                        />
                    </div>
                </div>
            ))}
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-12">
            {dailyLogs.map((log, i) => (
                <div key={log.date} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-black text-slate-900">{log.day}</h3>
                        <span className="text-sm font-bold text-slate-400">{log.date}</span>
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-lg">
                            {log.total} Attended
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {log.classes.map((cls, j) => (
                            <motion.div
                                key={cls.name + j}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (i * 0.1) + (j * 0.05) }}
                            >
                                <Card className={cn(
                                    "p-5 rounded-[2rem] border transition-all",
                                    cls.status === 'Present' 
                                    ? "bg-white border-slate-100 hover:border-emerald-200" 
                                    : "bg-rose-50 border-rose-100"
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            cls.status === 'Present' ? "bg-emerald-50 text-emerald-600" : "bg-rose-500 text-white shadow-lg shadow-rose-200"
                                        )}>
                                            {cls.status === 'Present' ? <CheckCircle2 className="w-5 h-5" /> : <XSquare className="w-5 h-5" />}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                            <Clock className="w-3 h-3" />
                                            {cls.time}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 line-clamp-1">{cls.name}</h4>
                                    <p className={cn(
                                        "text-[10px] font-black uppercase tracking-widest mt-1",
                                        cls.status === 'Present' ? "text-emerald-500" : "text-rose-600"
                                    )}>
                                        {cls.status}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Contact Teacher Prompt */}
        <div className="p-8 rounded-[3rem] bg-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
            <div className="space-y-2 text-center md:text-left">
                <h4 className="text-xl font-bold">Need to report an absence?</h4>
                <p className="text-indigo-200 text-sm font-medium">Instantly notify the teacher regarding leave or medical issues.</p>
            </div>
            <button className="whitespace-nowrap px-8 py-3 bg-white text-indigo-900 text-xs font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-black/20">
                Message Teacher
            </button>
        </div>
      </div>
    </PageTransition>
  );
}
