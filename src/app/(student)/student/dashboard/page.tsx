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
import { supabase } from "@/lib/supabase";
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
        
        // 1. Resolve Identity
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Fetch Student Profile by Email
        const { data: studentRecord } = await supabase
          .from('students')
          .select('*, classes(*)')
          .eq('email', user.email)
          .single();

        if (!studentRecord) {
          setStudent({ name: user.user_metadata.full_name || "Unknown", roll: "N/A" });
          return;
        }

        // 3. Fetch Real-time Attendance Logs for math
        const { data: attendanceLogs } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentRecord.id);

        const conductedCount = attendanceLogs?.length || 0;
        const presentCount = attendanceLogs?.filter(l => l.status === 'present' || l.status === 'od' || l.status === 'ml').length || 0;
        const livePercentage = conductedCount > 0 ? (presentCount / conductedCount) * 100 : 85; // Default for fresh trial

        setStudent({ 
          name: studentRecord.name, 
          roll: studentRecord.roll_number,
          class_id: studentRecord.class_id,
          className: studentRecord.classes?.name,
          attendancePercentage: livePercentage
        });

        // 4. Fetch Next Exam relative to student's class
        const exam = await academicService.getUpcomingExam(studentRecord.class_id);
        setNextExam(exam);
        
        // 5. Load Performance Context
        const marksData = await academicService.getStudentMarks(studentRecord.id);
        if (marksData && marksData.length > 0) {
            setPerformance(getStudentPerformance({
                ...marksData[0],
                attendancePercentage: livePercentage
            }));
        } else {
            setPerformance(getStudentPerformance({ attendancePercentage: livePercentage }));
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
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

  if (loading) return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Identity</p>
      </div>
  );

  const isEligible = (student?.attendancePercentage || 0) >= 75;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 max-w-7xl mx-auto px-6">
        <header className="py-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                    <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-[1000] text-slate-900 tracking-tighter">Academic Hub</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Access • {student?.name}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-slate-900">{student?.roll}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-tighter border border-emerald-100 mt-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Trial Active
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* 🚩 ELIGIBILITY & EXAM GATE 🚩 */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className={cn(
                        "p-10 rounded-[3.5rem] border-none text-white relative overflow-hidden shadow-2xl transition-all h-[360px] flex flex-col justify-between",
                        isEligible ? "bg-slate-900 shadow-slate-200" : "bg-red-950 shadow-red-200"
                    )}>
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-40 -mt-40" />
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-3">
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    isEligible ? "bg-white/10 text-white" : "bg-rose-500 text-white"
                                )}>
                                    {isEligible ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {isEligible ? "Course Eligibility: Granted" : "Regularity: Critical Alert"}
                                </div>
                                <h2 className="text-5xl font-black tracking-tighter pt-4">
                                    {isEligible ? "Hall Ticket" : "Access Blocked"}
                                </h2>
                                <p className="text-sm font-bold opacity-60 max-w-xs leading-relaxed">
                                    {isEligible 
                                        ? "Your attendance meets institutional norms. Download your entry QR below."
                                        : "Regularity falls below 75%. Hall ticket withholding protocol initiated."
                                    }
                                </p>
                            </div>

                            {isEligible && (
                                <div className="bg-white p-4 rounded-[2rem] shadow-2xl rotate-3">
                                    <div className="w-32 h-32 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STU-${student?.roll}`} alt="QR" className="w-24 h-24 mix-blend-multiply" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative z-10 flex items-center gap-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Upcoming Milestone</p>
                                <p className="text-xl font-black">{nextExam?.subject || "Check Notice Board"}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Room Assignment</p>
                                <p className="text-xl font-black">{nextExam?.room_number || "TBA"}</p>
                            </div>
                            {nextExam && (
                                <>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="bg-white/10 px-4 py-2 rounded-2xl">
                                        <span className="text-2xl font-black italic">{daysUntil(nextExam.exam_date)}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest ml-2 opacity-60">Days Left</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Presence" value={`${student?.attendancePercentage.toFixed(1)}%`} color="bg-blue-600" icon={CheckCircle} delay={0.2} />
                <StatCard title="Financial Clearance" value="Clearance Reg." color="bg-emerald-500" icon={CreditCard} delay={0.3} />
            </div>

            <Card className="p-10 border-slate-100 rounded-[3.5rem] bg-white shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Performance</h3>
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-10">
                    <BreakdownItem label="Regularity (Calculated)" value={performance?.attendanceMarks} max={5} color="bg-blue-600" />
                    <BreakdownItem label="CIA Assessments" value={performance?.ciaTotal} max={5} color="bg-indigo-500" />
                    <BreakdownItem label="Technical Tests" value={performance?.testScore} max={10} color="bg-slate-900" />
                </div>
            </Card>
          </div>

          <div className="space-y-10">
            <Card className="p-10 border-slate-100 rounded-[3.5rem] bg-slate-50 border-none shadow-sm min-h-[600px] flex flex-col">
                <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-widest">Notice Feed</h3>
                <div className="space-y-8 flex-1">
                    <AlertItem title="Trial Period Active" time="Day 1/3" color="blue" />
                    <AlertItem title="Hall Ticket Window" time="Closing Soon" color="amber" />
                    <AlertItem title="Institutional Update" time="L4 Cancelled" color="rose" />
                </div>
                
                <div className="mt-auto pt-10">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-[2rem] mx-auto mb-6 flex items-center justify-center",
                            isEligible ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                        )}>
                            <TrophyIcon className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Hall Access Protocol</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                            {isEligible ? "Your digital entry token is active" : "Blocked due to attendance shortage"}
                        </p>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function AlertItem({ title, time, color }: any) {
    const colorMap: any = {
        blue: "bg-blue-500",
        amber: "bg-amber-500",
        rose: "bg-rose-500"
    };
    return (
        <div className="flex items-center gap-4 group cursor-default">
            <div className={cn("w-2 h-2 rounded-full", colorMap[color])} />
            <div className="flex-1">
                <p className="text-sm font-black text-slate-800 tracking-tight">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
        </div>
    );
}

function StatCard({ title, value, max, icon: Icon, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
        >
            <Card className="p-10 border-slate-100 shadow-sm rounded-[3rem] bg-white group hover:shadow-2xl hover:translate-y-[-4px] transition-all border border-slate-100">
                <div className="flex items-center justify-between">
                    <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-12", color)}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
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
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="text-slate-900">{label}</span>
                <span className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{value} / {max}</span>
            </div>
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
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
