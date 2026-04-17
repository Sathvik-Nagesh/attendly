"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Award, 
  ChevronRight, 
  Star,
  Trophy,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { academicService } from "@/services/academic";
import { useQuery } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { supabase } from "@/lib/supabase";

export default function StudentMarksPage() {
  const { data: academicData, isLoading } = useQuery({
    queryKey: ['student-academic-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const student = await academicService.getStudentByEmail(user.email!);
      if (!student) return null;

      const [marks, summary] = await Promise.all([
        academicService.getStudentMarks(student.id),
        academicService.getStudentSummary(student.id)
      ]);

      return { student, marks, summary };
    }
  });

  const marks = academicData?.marks;
  const summary = academicData?.summary;

  const displaySubjects = marks ? [
    { name: "Mathematics", code: "MAT", marks: marks.math },
    { name: "Science", code: "SCI", marks: marks.science },
    { name: "English", code: "ENG", marks: marks.english },
    { name: "Physics", code: "PHY", marks: marks.physics },
    { name: "Computer Science", code: "CS", marks: marks.computer_science },
    { name: "History", code: "HIS", marks: marks.history },
  ].map(s => {
    // Standardize to 20 for Internal Display
    const internalMarks = s.marks > 20 ? Math.round((s.marks / 100) * 20) : s.marks;
    
    // Calculate Attendance Marks based on slabs
    const attPct = summary?.attendancePct || 0;
    let attMarks = 2;
    if (attPct >= 90) attMarks = 5;
    else if (attPct >= 80) attMarks = 4;
    else if (attPct >= 75) attMarks = 3;

    // Remaining 15 marks split between CIA (5) and Tests (10)
    // We use a 1:2 ratio for the remaining score if we don't have granular data
    const remaining = Math.max(0, internalMarks - attMarks);
    const cia = Math.min(5, Math.round(remaining * (5/15)));
    const tests = Math.min(10, remaining - cia);

    return {
        ...s,
        credits: 4,
        displayMarks: { 
          cia: `${cia}/5`, 
          tests: `${tests}/10`, 
          attendance: `${attMarks}/5`, 
          total: `${internalMarks}/20` 
        },
        grade: internalMarks >= 18 ? "O" : internalMarks >= 15 ? "A+" : internalMarks >= 12 ? "A" : "B"
    };
  }) : [];

  if (isLoading) return <LoadingScreen />;
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-6xl mx-auto space-y-10 px-4 md:px-0">
        
        <header className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 md:hidden" onClick={() => window.history.back()}>
                    <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Records</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Session: Spring 2026 ({academicData?.student?.department || "General"})</p>
                </div>
            </div>
        </header>

        {/* GPA Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 rounded-[2rem] bg-slate-900 border-none text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                    <Award className="w-8 h-8 text-yellow-400 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internal CGPA</p>
                    <h2 className="text-4xl font-bold">{summary?.cgpa || "0.0"}</h2>
                </div>
            </Card>
            <StatusStat label="Total Credits" value={summary?.credits || "0 / 24"} icon={BookOpen} color="blue" />
            <StatusStat label="Dept Rank" value={summary?.rank || "N/A"} icon={Trophy} color="emerald" />
        </div>

        {/* Detailed Table */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Subject-wise Breakdown</h3>
            <div className="grid grid-cols-1 gap-4">
                {displaySubjects.map((sub, i) => (
                    <motion.div
                        key={sub.code}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-5 border-slate-100 border border-slate-100 hover:border-blue-200 transition-all group rounded-3xl bg-white shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4 min-w-[240px]">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 shadow-sm">
                                        {sub.code}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 leading-tight">{sub.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{sub.credits} Credits • Major Tier</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                                    <MarkItem label="CIA" val={sub.displayMarks.cia} />
                                    <MarkItem label="Test Wt." val={sub.displayMarks.tests} />
                                    <MarkItem label="Attendance" val={sub.displayMarks.attendance} />
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Final Score</p>
                                        <p className="text-sm font-bold text-blue-600">{sub.displayMarks.total}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pl-6 border-l border-slate-50 md:min-w-[100px] justify-end">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                                        sub.grade === 'O' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                        sub.grade === 'A+' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500'
                                    )}>
                                        {sub.grade}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Legend */}
        <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                   <Star className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
               </div>
               <p className="text-sm font-bold text-indigo-900/80 italic leading-relaxed">
                 {summary?.attendancePct && summary.attendancePct > 90 
                   ? "Excellent! Your high attendance is boosting your internal weightage."
                   : "Reminder: Consistent attendance is key to improving your academic weightage."}
               </p>
            </div>
            <Button className="px-8 py-6 bg-slate-900 border-none text-white text-xs font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                Download Official Marksheet
            </Button>
        </div>

      </div>
    </PageTransition>
  );
}

function MarkItem({ label, val }: any) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tight">{label}</p>
            <p className="text-xs font-bold text-slate-700">{val}</p>
        </div>
    )
}

function StatusStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };
    return (
        <Card className="p-6 rounded-[2rem] bg-white border-slate-100 shadow-sm flex items-center justify-between border border-slate-100 group hover:border-slate-300 transition-colors">
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
               <h2 className="text-3xl font-bold text-slate-900">{value}</h2>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors[color])}>
                <Icon className="w-6 h-6" />
            </div>
        </Card>
    );
}
