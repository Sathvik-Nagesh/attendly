"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  Radio, 
  MapPin, 
  Zap, 
  ShieldAlert, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Target,
  FileDown,
  Building2,
  PieChart
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

import { academicService } from "@/services/academic";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useQuery } from "@tanstack/react-query";

export default function CampusPulsePage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['campus-pulse'],
    queryFn: () => academicService.getSummaryStats(),
    refetchInterval: 30000, // Refresh every 30s
  });

  const handleExport = (type: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Compiling Dept-wide ${type} Report...`,
        success: `${type} Data Exported to Central ERP`,
        error: 'Export failed'
      }
    );
  };

  if (isLoading) return <LoadingScreen />;
  if (!stats) return null;

  const aggregateAttendance = stats.departmentPulse.length > 0 
    ? stats.departmentPulse.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / stats.departmentPulse.length
    : 0;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-10">
        <Header title="Campus Intelligence" />
        
        <div className="flex-1 py-8 space-y-10">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card className="p-8 bg-slate-900 border-none rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Real-time Pulse</p>
                  </div>
                  <h3 className="text-4xl font-black">{Math.round(aggregateAttendance)}%</h3>
                  <p className="text-slate-500 text-xs font-bold">Aggregate Campus Attendance</p>
                </div>
                <Radio className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
             </Card>

             <StatBox title="Active Students" val={stats.totalStudents} icon={Users} trend="Institutional Strength" color="text-blue-500" />
             <StatBox title="Today's Absentees" val={stats.absenteesToday} icon={ShieldAlert} trend="Pending Notifications" color="text-rose-500" />
             <StatBox title="Live Classes" val={stats.totalClasses} icon={Building2} trend="Active Sessions" color="text-emerald-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dept Attendance Chart */}
            <Card className="lg:col-span-2 p-8 border-slate-100 rounded-[3rem] bg-white shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 leading-none">Global Performance</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Department-wise Attendance Distribution</p>
                    </div>
                    <button 
                        onClick={() => handleExport('Analytics')}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        <PieChart className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.departmentPulse} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                                height={40}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '800' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="percentage" radius={[12, 12, 0, 0]}>
                                {stats.departmentPulse.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][index % 4]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Admin Tasks / Sidebar */}
            <div className="space-y-8">
                <Card className="p-8 bg-blue-600 rounded-[3rem] text-white shadow-xl shadow-blue-100 border-none">
                    <h4 className="text-xl font-bold mb-6">Recent Activity</h4>
                    <div className="space-y-4">
                        {stats.recentActivity.map((req: any) => (
                            <div key={req.id} className="p-4 bg-white/10 rounded-2xl space-y-1 hover:bg-white/15 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-black">{req.text}</p>
                                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-blue-200 font-bold">{req.time}</p>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-400 text-emerald-900"
                                    )}>
                                        Verified
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-4 bg-white text-blue-600 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                        Sync Telemetry
                    </button>
                </Card>

                <Card className="p-8 border-slate-100 rounded-[3rem] bg-white shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <h4 className="text-sm font-black text-slate-900 uppercase">Resource Audit</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-bold">Room Occupancy</span>
                            <span className="text-slate-900 font-black">78%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div className="h-full bg-slate-900 w-[78%] rounded-full" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Currently monitoring 42 active labs and halls across 4 wings.
                    </p>
                </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatBox({ title, val, icon: Icon, trend, color }: any) {
    return (
        <Card className="p-8 bg-white border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all border hover:border-blue-100">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-4xl font-black text-slate-900">{val}</h3>
                </div>
                <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className={`mt-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${color}`}>
                 <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text', 'bg'))} />
                 {trend}
            </div>
        </Card>
    )
}
