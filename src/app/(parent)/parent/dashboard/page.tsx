"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, CheckCircle, Clock, ShieldAlert, TrendingUp, AlertCircle,
  Bell, BookOpen, UserCheck, MessageSquare, ChevronRight, Download, GraduationCap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";

export default function ParentDashboard() {
  // Mock institutional context for the trial
  const performance = {
    attendance: 68, // Threshold risk
    ciaTotal: 4.2,
    attendanceMarks: 3,
    totalSessions: 42,
    missedSessions: 14
  };

  const insights = {
    status: 'risk',
    alert: "Immediate attention required: Regularity has dropped below the 75% examination threshold.",
    nextExam: "Oct 25, 2026 - Data Structures"
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-10 space-y-12 max-w-7xl mx-auto pb-32">
        {/* Institutional Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-slate-100">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-5 py-2 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-200 animate-pulse">
                        Action Required
                    </span>
                    <span className="px-5 py-2 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                        U03FS23S0134
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                    Guardian <span className="text-slate-400">Portal.</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium max-w-xl">
                    Real-time academic oversight for <span className="text-slate-900 font-bold underline decoration-rose-500 underline-offset-4">Aryan Sharma</span> (BCA Section A).
                </p>
            </div>
            
            <StatusBadge status={insights.status} />
        </div>

        {/* Vital Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard label="Regularity" value={`${performance.attendance}%`} sub="75% Target" color="text-rose-600" icon={Clock} />
            <MetricCard label="Internal Marks" value={`${performance.ciaTotal}/5`} sub="Current average" color="text-slate-900" icon={CheckCircle} />
            <MetricCard label="Attendance Marks" value={`${performance.attendanceMarks}/5`} sub="Based on BU marks" color="text-slate-900" icon={Calendar} />
            <MetricCard label="Upcoming Exam" value="Oct 25" sub="Data Structures" color="text-blue-600" icon={BookOpen} />
        </div>

        {/* Alert System */}
        <AnimatePresence>
            {insights.alert && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                    <Card className={cn(
                        "p-8 rounded-[3rem] border-none shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 ring-1",
                        insights.status === 'risk' ? "bg-rose-50 ring-rose-200" : "bg-amber-50 ring-amber-200"
                    )}>
                        <div className={cn(
                            "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110",
                            insights.status === 'risk' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            <ShieldAlert className="w-10 h-10" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <h3 className={cn("text-2xl font-black", insights.status === 'risk' ? "text-rose-900" : "text-amber-900")}>
                                Institutional Alert
                            </h3>
                            <p className={cn("text-lg font-bold leading-relaxed", insights.status === 'risk' ? "text-rose-700/80" : "text-amber-700/80")}>
                                {insights.alert}
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                                <Button className={cn(
                                    "h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    insights.status === 'risk' ? "bg-rose-900 text-white hover:bg-rose-800" : "bg-amber-900 text-white hover:bg-amber-800"
                                )}>
                                    Schedule Advisor Call
                                </Button>
                                <Button variant="outline" className="h-14 px-8 rounded-2xl border-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-widest">
                                    View Detailed Policy
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Performance Breakdown */}
                <Card className="p-8 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Academic Standing</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Refined Performance Matrix</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <Download className="w-4 h-4 mr-2" /> Export
                             </Button>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <ParentProgressItem 
                            label="Attendance Ledger" 
                            current={performance.attendance} 
                            target={75} 
                            unit="%" 
                            color="bg-rose-500" 
                            icon={Clock} 
                        />
                        <ParentProgressItem 
                            label="Internal Assessments" 
                            current={performance.ciaTotal} 
                            target={5} 
                            unit=" Points" 
                            color="bg-blue-600" 
                            icon={CheckCircle} 
                        />
                         <ParentProgressItem 
                            label="Continuous Evaluation" 
                            current={performance.attendanceMarks} 
                            target={5} 
                            unit=" Points" 
                            color="bg-emerald-500" 
                            icon={Calendar} 
                        />
                    </div>
                </Card>

                {/* Subject Wise Grid - RESTORED */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200" />
                        Detailed Subject Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SubjectMiniCard subject="Data Structures" attendance={82} marks="4.5/5" status="good" />
                        <SubjectMiniCard subject="Computer Networks" attendance={71} marks="3.8/5" status="warning" />
                        <SubjectMiniCard subject="Operating Systems" attendance={65} marks="2.9/5" status="risk" />
                        <SubjectMiniCard subject="Discrete Math" attendance={88} marks="4.8/5" status="good" />
                    </div>
                </div>

                {/* Communication Log */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        Institutional Correspondence
                    </h3>
                    <div className="space-y-3">
                        <CorrespondenceItem title="Attendance Shortage Mailer" date="2 hours ago" type="Warning" />
                        <CorrespondenceItem title="Semester Result Published" date="3 days ago" type="Notification" />
                        <CorrespondenceItem title="Internal Marks Upload" date="1 week ago" type="System" />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Exam Schedule */}
                <Card className="p-8 rounded-[3rem] bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                        <Calendar className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                                <Clock className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Exam Countdown</h3>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Oct 2026 Season</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Next Milestone</p>
                                <p className="text-3xl font-black italic tracking-tighter">In 09 Days</p>
                                <p className="text-xs text-white/50 font-bold mt-2">Data Structures & Programming</p>
                            </div>
                            <div className="space-y-3">
                                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-blue-900/40 border-none active:scale-95">
                                    Download Hall Ticket
                                </Button>
                                <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest transition-all">
                                    View Full Schedule
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quick Shortcuts */}
                <Card className="p-8 rounded-[3rem] bg-indigo-600 text-white border-none shadow-2xl">
                    <h3 className="text-lg font-black italic uppercase tracking-tighter mb-6">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ShortcutBtn icon={Download} label="Receipts" />
                        <ShortcutBtn icon={Bell} label="Notices" />
                        <ShortcutBtn icon={GraduationCap} label="Syllabus" />
                        <ShortcutBtn icon={UserCheck} label="Leave" />
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}

function SubjectMiniCard({ subject, attendance, marks, status }: any) {
    return (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'good' ? "bg-emerald-500" : status === 'warning' ? "bg-amber-500" : "bg-rose-500"
                )} />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{attendance}% Avg</span>
            </div>
            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{subject}</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Marks: {marks}</p>
        </div>
    );
}

function ShortcutBtn({ icon: Icon, label }: any) {
    return (
        <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5 gap-2">
            <Icon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <div className={cn(
            "px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl",
            status === 'risk' ? "bg-rose-500 text-white shadow-rose-200" : "bg-emerald-500 text-white shadow-emerald-200"
        )}>
            {status === 'risk' ? "At Academic Risk" : "Stability Locked"}
        </div>
    );
}

function MetricCard({ label, value, sub, color, icon: Icon }: any) {
    return (
        <Card className="p-8 rounded-[2.5rem] bg-white border-slate-50 shadow-sm flex flex-col items-center text-center space-y-4 group hover:shadow-xl transition-all">
            <div className={cn("w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={cn("text-3xl font-black italic", color)}>{value}</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">{sub}</p>
            </div>
        </Card>
    );
}

function ParentProgressItem({ label, current, target, unit, color, icon: Icon }: any) {
    const percentage = Math.min((current / target) * 100, 100);
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-black text-slate-900">{current}{unit}</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Goal: {target}{unit}</p>
                </div>
            </div>
            <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={cn("h-full rounded-full shadow-lg", color)}
                />
            </div>
        </div>
    );
}

function CorrespondenceItem({ title, date, type }: any) {
    return (
        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                    type === 'Warning' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                )}>
                    {type === 'Warning' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <span className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                    type === 'Warning' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                 )}>
                    {type}
                 </span>
                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
}
