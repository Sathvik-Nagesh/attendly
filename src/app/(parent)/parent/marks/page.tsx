"use client";

import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target, 
  Lightbulb,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  FileBarChart
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const subjectReports = [
  { name: "Mathematics IV", score: "19/20", status: "Excellent", color: "bg-emerald-500", trend: "up" },
  { name: "Object Oriented Design", score: "17/20", status: "Very Good", color: "bg-blue-500", trend: "up" },
  { name: "Operating Systems", score: "14/20", status: "Average", color: "bg-amber-500", trend: "stable" },
  { name: "Hardware Microprocessors", score: "11/20", status: "Needs Support", color: "bg-rose-500", trend: "down" },
];

export default function ParentMarksPage() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-5xl mx-auto space-y-12">
        
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Progress Report</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Real-time academic evaluation for Alex Johnson</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl shadow-xl hover:shadow-slate-200 transition-all">
                <Target className="w-4 h-4" />
                Set Goals
            </button>
        </header>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-none bg-indigo-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <Award className="w-10 h-10 text-indigo-400 mb-6" />
                <h3 className="text-xl font-bold mb-2">Internal Assessment Summary</h3>
                <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                    Based on recent test data, your child has secured **17.5 out of 20** overall. 
                    This is significantly higher than the class median.
                </p>
                <div className="mt-8 pt-6 border-t border-indigo-800 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Predicted Semester GPA</span>
                    <span className="text-2xl font-black text-emerald-400">8.84</span>
                </div>
            </Card>

            <Card className="p-8 border-slate-100 rounded-[3rem] bg-white shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="w-6 h-6 text-amber-500" />
                        <h3 className="text-xl font-bold text-slate-800">Faculty Feedback</h3>
                    </div>
                    <p className="text-slate-500 font-medium italic">
                        "Alex is exceptionally strong in logic-based subjects like Maths. 
                        Encourage them to spend an extra 30 mins daily on Microprocessors hardware labs."
                    </p>
                </div>
                <div className="mt-8 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                    <span className="text-xs font-bold text-slate-600">— Dr. Sarah Mitchell (HOD)</span>
                </div>
            </Card>
        </div>

        {/* Detailed Breakdown */}
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Subject Insights</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    <HelpCircle className="w-3 h-3" />
                    How is this calculated?
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {subjectReports.map((sub, i) => (
                    <motion.div
                        key={sub.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-6 border-slate-100 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5 flex-1">
                                <div className={cn("w-3 h-12 rounded-full shrink-0", sub.color)} />
                                <div>
                                    <h4 className="font-bold text-slate-900">{sub.name}</h4>
                                    <p className={cn("text-xs font-black uppercase tracking-widest", sub.status === 'Needs Support' ? 'text-rose-500' : 'text-slate-400')}>
                                        {sub.status}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-12">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Internal Score</p>
                                    <p className="text-lg font-black text-slate-900">{sub.score}</p>
                                </div>
                                <div className="hidden sm:block">
                                   {sub.trend === 'up' ? <ArrowUpRight className="w-6 h-6 text-emerald-500" /> : <ArrowDownRight className="w-6 h-6 text-rose-500" />}
                                </div>
                                <button className="px-5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                                    View Tests
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Export Action */}
        <div className="p-8 rounded-[3.5rem] bg-slate-50 border border-slate-100 text-center space-y-4">
            <FileBarChart className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Need a detailed printable report?</h4>
            <p className="text-sm text-slate-500 font-medium">Download the monthly progress digest with complete faculty annotations and benchmark analysis.</p>
            <button className="px-8 py-3 bg-white border border-slate-200 text-xs font-extrabold text-slate-900 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
                Generate Progress Digest
            </button>
        </div>
      </div>
    </PageTransition>
  );
}
