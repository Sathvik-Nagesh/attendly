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
import { useState, useEffect } from "react";
import { academicService } from "@/services/academic";
import { toast } from "sonner";

const subjects = [
  { 
    name: "Data Structures & Algos", 
    code: "CS401", 
    credits: 4,
    marks: { cia: "4.5/5", tests: "1.8/2", attendance: "5/5", total: "17.5/20" },
    grade: "O"
  },
  { 
    name: "Operating Systems", 
    code: "CS402", 
    credits: 3,
    marks: { cia: "3.5/5", tests: "1.4/2", attendance: "4/5", total: "14.5/20" },
    grade: "A+"
  },
  { 
    name: "Discrete Mathematics", 
    code: "MA403", 
    credits: 4,
    marks: { cia: "5/5", tests: "1.9/2", attendance: "5/5", total: "19/20" },
    grade: "O"
  },
  { 
    name: "Microprocessors", 
    code: "EC404", 
    credits: 3,
    marks: { cia: "3/5", tests: "1.2/2", attendance: "4/5", total: "13/20" },
    grade: "B"
  },
];

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        // Test Candidate: Aarav Sharma (CS-11)
        const data = await academicService.getStudentMarks('1'); 
        setMarks(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const displaySubjects = marks.length > 0 ? marks.map(m => ({
    name: m.subject_name,
    code: m.subject_code || "GEN",
    credits: 4,
    marks: { cia: `${m.cia1+m.cia2}/10`, tests: `${m.tests}/10`, attendance: "100%", total: `${m.cia1+m.cia2+m.tests}/20` },
    grade: "A"
  })) : subjects; // Fallback to mocks if DB is empty
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
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Session: Spring 2026 (Semester IV)</p>
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
                    <h2 className="text-4xl font-bold">9.2</h2>
                </div>
            </Card>
            <StatusStat label="Total Credits" value="22 / 24" icon={BookOpen} color="blue" />
            <StatusStat label="Dept Rank" value="#12" icon={Trophy} color="emerald" />
        </div>

        {/* Detailed Table */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Subject-wise Breakdown</h3>
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                   Array(3).fill(0).map((_, i) => (
                       <div key={i} className="h-24 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse" />
                   ))
                ) : displaySubjects.map((sub, i) => (
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
                                    <MarkItem label="CIA" val={sub.marks.cia} />
                                    <MarkItem label="Test Wt." val={sub.marks.tests} />
                                    <MarkItem label="Attendance" val={sub.marks.attendance} />
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Final Score</p>
                                        <p className="text-sm font-bold text-blue-600">{sub.marks.total}</p>
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
               <p className="text-sm font-bold text-indigo-900/80 italic leading-relaxed">"Consistent high attendance in MA403 is boosting your final weightage by 5%!"</p>
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
