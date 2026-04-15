"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Download, Filter, Search, Award, RefreshCcw, LayoutGrid, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn, fuzzySearch } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ResultsPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ high: 0, avg: 0, count: 0 });

  const loadResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_class_performance_summary');
      if (error) throw error;
      setResults(data || []);
      
      if (data && data.length > 0) {
          const validScores = data.filter((d: any) => d.average_score > 0);
          const highest = Math.max(...data.map((d: any) => d.average_score));
          const totalAvg = validScores.reduce((acc: number, curr: any) => acc + curr.average_score, 0) / (validScores.length || 1);
          setStats({
              high: highest,
              avg: totalAvg,
              count: data.length
          });
      }
    } catch (err) {
      toast.error("Failed to compile academic summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const filteredResults = results.filter(r => 
    fuzzySearch(search, `${r.class_name} ${r.section}`)
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Compiling Institutional Merit List</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Institutional Merit Terminal" />
        
        <div className="flex-1 py-10 space-y-10 px-6 md:px-0">
             {/* Intelligence Hub */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ResultStat label="Institutional High" value={`${stats.high}%`} icon={Award} color="emerald" />
                <ResultStat label="Fleet Average" value={`${stats.avg.toFixed(1)}%`} icon={TrendingUp} color="blue" />
                <ResultStat label="Active Sections" value={`${stats.count} Classes`} icon={GraduationCap} color="amber" />
             </div>

             {/* Registry Control */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Identify section or result node..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-14 rounded-2xl border-none bg-white/10 text-white placeholder:text-slate-500 font-bold focus:ring-4 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="h-14 rounded-2xl text-slate-400 font-bold text-xs gap-3 hover:text-white hover:bg-white/5 uppercase tracking-widest px-6">
                            <Filter className="w-4 h-4" /> Refine
                        </Button>
                        <Button 
                            onClick={() => {
                                try {
                                    const doc = new jsPDF() as any;
                                    const timestamp = format(new Date(), 'dd-MMM-yyyy HH:mm');

                                    // 1. Branding Header
                                    doc.setFontSize(22);
                                    doc.text("ATTENDEX CONSOLIDATED MERIT LIST", 105, 20, { align: "center" });
                                    
                                    doc.setFontSize(10);
                                    doc.text(`Institutional Analytics Summary | Generated: ${timestamp}`, 105, 28, { align: "center" });

                                    // 2. Summary Box
                                    doc.setFillColor(248, 250, 252);
                                    doc.rect(14, 35, 182, 25, 'F');
                                    doc.setFontSize(12);
                                    doc.text(`Institutional High: ${stats.high}%`, 20, 45);
                                    doc.text(`Fleet Average: ${stats.avg.toFixed(1)}%`, 20, 52);
                                    doc.text(`Active Enrollment: ${results.length} Sections`, 120, 45);

                                    // 3. Table Ingestion
                                    const tableData = results.map(r => [
                                        r.class_name,
                                        r.section || 'A',
                                        r.student_count,
                                        `${r.average_score}%`,
                                        r.status
                                    ]);

                                    (doc as any).autoTable({
                                        startY: 70,
                                        head: [["Section Name", "Sec", "Units", "Avg Merit", "Status"]],
                                        body: tableData,
                                        theme: "striped",
                                        headStyles: { fillColor: [15, 23, 42] }
                                    });

                                    // 4. Verification
                                    const finY = (doc as any).lastAutoTable.finalY + 30;
                                    doc.text("HOD SIGNATURE: __________________________", 14, finY);
                                    
                                    doc.save(`Consolidated_Merit_Report_${format(new Date(), 'yyyy_MM')}.pdf`);
                                    toast.success("Institutional Merit PDF Exported");
                                } catch (err) {
                                    toast.error("Compilation failed");
                                }
                            }}
                            className="h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] gap-3 px-8 hover:bg-slate-100 shadow-xl transition-all"
                        >
                            <Download className="w-5 h-5 text-blue-600" /> Export All
                        </Button>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2 pr-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Live Forensics</span>
                </div>
             </div>

             {/* Results Ledger */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredResults.map((res, i) => (
                        <motion.div
                            key={res.class_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="p-8 border-none ring-1 ring-slate-100 rounded-[2.5rem] bg-white group hover:shadow-3xl transition-all relative overflow-hidden h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ClipboardList className="w-24 h-24 text-slate-900" />
                                </div>
                                
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className={cn(
                                            "text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border",
                                            res.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {res.status}
                                        </span>
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <LayoutGrid className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 pr-6 uppercase italic italic-none">{res.class_name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Section {res.section || 'N/A'} • {res.student_count} Registered Units</p>
                                    
                                    <div className="mt-auto pt-8 border-t border-slate-50 grid grid-cols-2 gap-8 items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Merit Average</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{res.average_score}</span>
                                                <span className="text-xs font-black text-slate-300">%</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="outline"
                                            className="h-12 rounded-xl bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-inner"
                                        >
                                            Audit Roster
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredResults.length === 0 && (
                    <div className="col-span-full py-32 text-center text-slate-400 font-black text-sm uppercase tracking-[0.4em] opacity-30 italic">No Academic Records Identified</div>
                )}
             </div>
        </div>
      </div>
    </PageTransition>
  );
}

function ResultStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/10",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10",
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10"
    };
    return (
        <Card className="p-10 rounded-[3rem] border-none bg-white shadow-xl flex items-center justify-between group hover:shadow-2xl transition-all ring-1 ring-slate-100">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic italic-none">{value}</p>
            </div>
            <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-xl", colors[color])}>
                <Icon className="w-8 h-8" />
            </div>
        </Card>
    );
}
