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

const subjects = [
  { 
    name: "Data Structures & Algos", 
    code: "CS401", 
    credits: 4,
    marks: { cia: "4.5/5", tests: "8/10", attendance: "5/5", total: "17.5/20" },
    grade: "O",
    trend: "up"
  },
  { 
    name: "Operating Systems", 
    code: "CS402", 
    credits: 3,
    marks: { cia: "3.5/5", tests: "7/10", attendance: "4/5", total: "14.5/20" },
    grade: "A+",
    trend: "stable"
  },
  { 
    name: "Discrete Mathematics", 
    code: "MA403", 
    credits: 4,
    marks: { cia: "5/5", tests: "9/10", attendance: "5/5", total: "19/20" },
    grade: "O",
    trend: "up"
  },
  { 
    name: "Microprocessors", 
    code: "EC404", 
    credits: 3,
    marks: { cia: "3/5", tests: "6/10", attendance: "4/5", total: "13/20" },
    grade: "B",
    trend: "down"
  },
];

export default function StudentMarksPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-6xl mx-auto space-y-10">
        
        <header>
            <h1 className="text-3xl font-extrabold text-slate-900">Marks & Grades</h1>
            <p className="text-slate-500 font-medium">Session: Spring 2024 (Semester IV)</p>
        </header>

        {/* GPA Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 rounded-[2rem] bg-slate-900 border-none text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10">
                    <Award className="w-8 h-8 text-yellow-400 mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target CGPA</p>
                    <h2 className="text-4xl font-black">9.2</h2>
                </div>
            </Card>
            <Card className="p-6 rounded-[2rem] bg-white border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
                   <h2 className="text-3xl font-extrabold text-slate-900">22 / 24</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                </div>
            </Card>
            <Card className="p-6 rounded-[2rem] bg-white border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rank in Dept</p>
                   <h2 className="text-3xl font-extrabold text-slate-900">#12</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                </div>
            </Card>
        </div>

        {/* Detailed Table */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Subject-wise Breakdown</h3>
            <div className="grid grid-cols-1 gap-4">
                {subjects.map((sub, i) => (
                    <motion.div
                        key={sub.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-5 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group rounded-3xl bg-white">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                                        {sub.code}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{sub.name}</h4>
                                        <p className="text-xs text-slate-400 font-bold">{sub.credits} Credits • Theory + Lab</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-8 flex-1 max-w-xl">
                                    <MarkItem label="CIA" val={sub.marks.cia} />
                                    <MarkItem label="Tests" val={sub.marks.tests} />
                                    <MarkItem label="Attendance" val={sub.marks.attendance} />
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Final Internal</p>
                                        <p className="text-sm font-black text-blue-600">{sub.marks.total}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg",
                                        sub.grade === 'O' ? 'bg-emerald-50 text-emerald-600' : 
                                        sub.grade === 'A+' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                                    )}>
                                        {sub.grade}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Legend */}
        <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <Star className="w-6 h-6 text-indigo-500 fill-current" />
               <p className="text-sm font-bold text-indigo-900 italic">"Consistent high attendance in MA403 is boosting your final weightage by 5%!"</p>
            </div>
            <button className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                Download Marksheet
            </button>
        </div>
      </div>
    </PageTransition>
  );
}

function MarkItem({ label, val }: any) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
            <p className="text-xs font-bold text-slate-700">{val}</p>
        </div>
    )
}
