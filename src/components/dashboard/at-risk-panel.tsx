"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingDown, CheckCircle2, ChevronRight, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectAttendance } from "@/services/analytics.service";
import { motion } from "framer-motion";

interface AtRiskPanelProps {
    students: any[];
    estimatedTotal?: number;
}

export function AtRiskPanel({ students, estimatedTotal = 50 }: AtRiskPanelProps) {
    const atRisk = students.map(s => ({
        ...s,
        projection: projectAttendance(s.present || 0, s.conducted || 0, estimatedTotal)
    })).filter(s => s.projection.status !== 'SAFE' && s.projection.status !== 'EXCELLENT')
      .sort((a, b) => a.projection.maxPossiblePercentage - b.projection.maxPossiblePercentage);

    if (atRisk.length === 0) {
        return (
            <Card className="p-8 border-slate-200 shadow-sm rounded-2xl bg-white text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Operational Excellence</h3>
                <p className="text-xs text-slate-500">All students are currently on track for eligibility.</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Attendance Risk Radar</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Predictive Ineligibility Forecast</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{atRisk.length} At Risk</span>
                </div>
            </div>

            <div className="space-y-3">
                {atRisk.slice(0, 5).map((student, idx) => (
                    <motion.div 
                        key={student.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                                student.projection.status === 'CRITICAL' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            )}>
                                {student.name?.charAt(0) || "S"}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    Max Possible: <span className="font-bold">{student.projection.maxPossiblePercentage.toFixed(1)}%</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className={cn(
                                    "text-[10px] font-black uppercase tracking-tighter",
                                    student.projection.status === 'CRITICAL' ? "text-rose-600" : "text-amber-600"
                                )}>
                                    {student.projection.status}
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">
                                    Need {student.projection.targetRemaining} more
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                    </motion.div>
                ))}

                {atRisk.length > 5 && (
                    <button className="w-full py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                        View all critical alerts (+{atRisk.length - 5})
                    </button>
                )}
            </div>
        </Card>
    );
}
