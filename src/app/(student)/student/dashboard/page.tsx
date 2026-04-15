"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  GraduationCap, 
  FileCheck,
  ClipboardList,
  Trophy,
  RefreshCcw,
  Trophy as TrophyIcon,
  ChevronRight,
  AlertTriangle,
  CalendarDays,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    getStudentPerformance
} from "@/lib/marks-calculations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { academicService } from "@/services/academic";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [nextExam, setNextExam] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    const loadAcademicPulse = async () => {
      try {
        setLoading(true);
        // During trial, we use a fixed class context or fetch from user profile
        const exam = await academicService.getUpcomingExam('oyaajwqklxfmsroakria'); // Placeholder ID
        setNextExam(exam);
        
        // Mocking student data for calculation until marks are fully populated
        const mockStudent = {
            marks: { attendancePercentage: 78, cia1: 4, cia2: 3.5, test1: 32, test2: 35, assignment: 9.5 }
        };
        setStudent({ name: "Alex Johnson", roll: "CS26-001" });
        setPerformance(getStudentPerformance(mockStudent.marks));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAcademicPulse();
  }, []);

  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-200 uppercase tracking-widest">Synchronizing Academic ID...</div>;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20">
        <header className="py-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Academic Workstation</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Active • {student?.name}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900">{student?.roll}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Trial Environment</p>
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* 🚩 CRITICAL ALERT SECTION 🚩 */}
            <AnimatePresence>
                {nextExam && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className={cn(
                            "p-8 rounded-[3rem] border-none text-white relative overflow-hidden shadow-2xl transition-all",
                            daysUntil(nextExam.exam_date) <= 3 ? "bg-rose-900 shadow-rose-200" : "bg-slate-900 shadow-slate-200"
                        )}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center">
                                        <AlertTriangle className={cn("w-8 h-8", daysUntil(nextExam.exam_date) <= 3 ? "text-rose-400" : "text-amber-400")} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Critical Milestone</p>
                                        <h2 className="text-3xl font-black tracking-tighter">{nextExam.subject} Examination</h2>
                                        <div className="flex items-center gap-4 text-xs font-bold text-white/60">
                                            <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(nextExam.exam_date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Room {nextExam.room_number || 'TBA'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center md:flex-col gap-4 md:gap-0">
                                    <span className="text-6xl md:text-7xl font-black italic">{daysUntil(nextExam.exam_date)}</span>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Days Left</p>
                                        <p className="text-xs font-bold text-white/80">Eligibility: {performance?.eligibilityStatus || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Presence Rate" value={`${performance?.attendancePercentage}%`} color="bg-blue-500" icon={CheckCircle} delay={0.2} />
                <StatCard title="Fee Status" value="Pending" color="bg-amber-500" icon={CreditCard} delay={0.3} />
            </div>

            <Card className="p-8 border-slate-100 rounded-[3rem] bg-white shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Internal Progress</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-8">
                    <BreakdownItem label="Regularity (Attendance)" value={performance?.attendanceMarks} max={5} color="bg-emerald-500" />
                    <BreakdownItem label="CIA Assessments" value={performance?.ciaTotal} max={5} color="bg-purple-500" />
                    <BreakdownItem label="Technical Tests" value={performance?.testScore} max={10} color="bg-orange-500" />
                </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-8 border-slate-100 rounded-[3rem] bg-slate-50 border-none shadow-sm h-full">
                <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Safety Indicators</h3>
                <div className="space-y-6">
                    <AlertItem title="Verify Hall Ticket" time="2 days left" color="blue" />
                    <AlertItem title="Library Books Overdue" time="Immediate" color="rose" />
                    <AlertItem title="Lab Clearance" time="Pending" color="amber" />
                </div>
                
                <div className="mt-12 p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Exam Hall Access</p>
                    <div className="w-full aspect-square bg-slate-50 flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="text-center p-4">
                            <TrophyIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">QR ID Pending Unlock</p>
                        </div>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ title, value, max, icon: Icon, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <Card className="p-8 border-slate-100 shadow-sm rounded-[2.5rem] bg-white group hover:shadow-xl hover:translate-y-[-4px] transition-all border border-slate-100">
                <div className="flex items-center justify-between">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12", color, "shadow-" + color.split('-')[1] + "-200")}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function BreakdownItem({ label, value, max, color }: any) {
    const percentage = ((value || 0) / max) * 100;
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-slate-900">{value} / {max}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={cn("h-full rounded-full transition-all duration-1000", color)}
                />
            </div>
        </div>
    );
}

function AssignmentRow({ title, marks, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
            <div>
                <p className="text-sm font-bold text-slate-700">{title}</p>
                <p className={cn("text-[10px] font-bold uppercase", status === 'Graded' ? 'text-emerald-500' : 'text-slate-400')}>{status}</p>
            </div>
            <div className="text-sm font-bold text-slate-900">{marks}</div>
        </div>
    );
}
