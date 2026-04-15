"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Download, Filter, Search, Award } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACADEMIC_RESULTS = [
  { id: 1, class: "B.Tech CS - SEC A", exam: "Mid-Term II", average: "78%", status: "Published", students: 45 },
  { id: 2, class: "B.Tech CS - SEC B", exam: "Internal Assessment", average: "82%", status: "Published", students: 42 },
  { id: 3, class: "M.Tech AI - SEC A", exam: "Project Viva", average: "91%", status: "Pending", students: 12 },
];

export default function TeacherResultsPage() {
  const [search, setSearch] = useState("");

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Academic Results & Analysis" />
        
        <div className="flex-1 py-10 space-y-8">
             {/* Stats Hub */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResultStat label="Dept High Score" value="98%" icon={Award} color="emerald" />
                <ResultStat label="Avg Attendance" value="84%" icon={TrendingUp} color="blue" />
                <ResultStat label="Pending Reviews" value="3 Modules" icon={GraduationCap} color="amber" />
             </div>

             {/* Search & Actions */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Search class or exam..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-semibold"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200 font-bold text-xs gap-2">
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </Button>
                    <Button 
                        onClick={() => {
                            toast.promise(new Promise(r => setTimeout(r, 2500)), {
                                loading: 'Compiling academic data for all class sections...',
                                success: 'Consolidated Merit List (XLS) exported successfully!',
                                error: 'Export failed'
                            });
                        }}
                        className="h-10 rounded-xl bg-slate-900 border-none text-white font-bold text-xs gap-2 shadow-xl shadow-slate-200"
                    >
                        <Download className="w-3.5 h-3.5" /> Export All (XLS)
                    </Button>
                </div>
             </div>

             {/* Results Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ACADEMIC_RESULTS.map((res, i) => (
                    <motion.div
                        key={res.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-6 border-slate-100 rounded-[2rem] bg-white group hover:shadow-xl transition-all border border-slate-100 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                             
                             <div className="relative z-10">
                                 <div className="flex items-center justify-between mb-4">
                                     <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">
                                         {res.status}
                                     </span>
                                     <GraduationCap className="w-5 h-5 text-slate-200 group-hover:text-slate-900 transition-colors" />
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{res.class}</h3>
                                 <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-6">{res.exam}</p>
                                 
                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-300 uppercase">Average</p>
                                         <p className="text-lg font-bold text-slate-900">{res.average}</p>
                                     </div>
                                     <div className="text-right">
                                         <p className="text-[10px] font-bold text-slate-300 uppercase">Students</p>
                                         <p className="text-lg font-bold text-slate-900">{res.students}</p>
                                     </div>
                                 </div>

                                 <Button 
                                    onClick={() => {
                                        toast.promise(new Promise(r => setTimeout(r, 2000)), {
                                            loading: `Generating detailed report for ${res.class}...`,
                                            success: 'Detailed report generated successfully!',
                                            error: 'Failed to generate report'
                                        });
                                    }}
                                    className="w-full mt-6 h-10 rounded-xl bg-slate-50 border-none text-slate-600 hover:bg-slate-900 hover:text-white font-bold text-xs transition-all shadow-none"
                                 >
                                     View Detailed Report
                                 </Button>
                             </div>
                        </Card>
                    </motion.div>
                ))}
             </div>
        </div>
      </div>
    </PageTransition>
  );
}

function ResultStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };
    return (
        <Card className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-slate-300 transition-colors">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", colors[color])}>
                <Icon className="w-5 h-5 shadow-sm" />
            </div>
        </Card>
    );
}
