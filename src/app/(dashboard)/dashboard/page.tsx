"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Users, UserX, UserCheck, TrendingUp, Clock, CheckCircle, FileText, FileSpreadsheet, BarChart3, ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const weeklyData = [
  { name: "Mon", present: 45, absent: 5 },
  { name: "Tue", present: 48, absent: 2 },
  { name: "Wed", present: 42, absent: 8 },
  { name: "Thu", present: 47, absent: 3 },
  { name: "Fri", present: 49, absent: 1 },
];

const monthlyData = [
  { name: "Week 1", present: 220, absent: 30 },
  { name: "Week 2", present: 240, absent: 10 },
  { name: "Week 3", present: 190, absent: 60 },
  { name: "Week 4", present: 245, absent: 5 },
];

const SMS_QUEUE = [
  { id: "1", roll: "CS-02", status: "Sending", progress: 65, time: "Just now" },
  { id: "2", roll: "CS-14", status: "Queued", progress: 0, time: "Queued" },
  { id: "3", roll: "CS-28", status: "Delivered", progress: 100, time: "2m ago" },
];

const recentActivity = [
  { id: 1, text: "CS-101 attendance marked by Alex", time: "10 mins ago", type: "success" },
  { id: 2, text: "3 absent parent alerts dispatched", time: "1 hour ago", type: "alert" },
  { id: 3, text: "Physics-202 records synchronized", time: "2 hours ago", type: "success" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{label}</p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-emerald-600 flex items-center justify-between gap-4">
            Present: <span>{payload[0].value}</span>
          </p>
          <p className="text-xs font-semibold text-rose-500 flex items-center justify-between gap-4">
            Absent: <span>{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, label, icon: Icon, delay = 0, trendClass = "text-emerald-600", color = "blue" }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white hover:border-slate-300 transition-all group">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className={cn("text-[10px] font-bold py-0.5 px-2 rounded-full", colorClasses[color])}>
                                {label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">trend</span>
                        </div>
                    </div>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colorClasses[color])}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function DashboardPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const activeData = timeframe === 'week' ? weeklyData : monthlyData;

  const generateReport = (name: string) => {
    setIsGenerating(name);
    setTimeout(() => {
      setIsGenerating(null);
      toast.success(`${name} downloaded.`, {
        description: "Checking system directories for ledger completion."
      });
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Dashboard" />

        <div className="flex-1 py-8 space-y-6">
          {/* Top Headline Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Students Enrolled"
              value="248"
              label="+12%"
              icon={Users}
              delay={0.1}
              color="blue"
            />
            <StatCard
              title="Daily Attendance"
              value="93.1%"
              label="Optimal"
              icon={UserCheck}
              delay={0.2}
              color="emerald"
            />
            <StatCard
              title="Absentees"
              value="17"
              label="-4%"
              icon={UserX}
              delay={0.3}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart Section (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <TrendingUp className="w-4 h-4 text-slate-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Attendance Statistics</h3>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button 
                        onClick={() => setTimeframe('week')} 
                        className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", timeframe === 'week' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400')}
                    >Week</button>
                    <button 
                        onClick={() => setTimeframe('month')} 
                        className={cn("px-4 py-1.5 rounded-md text-xs font-bold transition-all", timeframe === 'month' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-400')}
                    >Month</button>
                  </div>
                </div>
                
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                      <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={32} />
                      <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 4, 4]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reports simplified */}
                <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Exports</h3>
                  <div className="space-y-3">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-between h-12 rounded-lg border-slate-100 font-semibold group"
                        onClick={() => generateReport('Defaulters')}
                    >
                        <div className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-rose-500" />
                             <span>Defaulter List (PDF)</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-between h-12 rounded-lg border-slate-100 font-semibold group"
                        onClick={() => generateReport('Ledger')}
                    >
                        <div className="flex items-center gap-2">
                             <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                             <span>Monthly Sheet (XLS)</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>

                {/* Activity Feed simplified */}
                <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                                <div className="mt-1">
                                    {activity.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-700 leading-tight">{activity.text}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
              </div>
            </div>

            {/* Sidebar Section (1/3 width) */}
            <div className="space-y-6">
              {/* SMS Gateway status */}
              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold text-slate-900">SMS Outbox</h3>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase">Online</span>
                   </div>
                </div>

                <div className="space-y-5">
                   {SMS_QUEUE.map((msg) => (
                       <div key={msg.id} className="space-y-2">
                           <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                               <span>{msg.roll} Dispatch</span>
                               <span className={cn(msg.status === 'Delivered' ? 'text-emerald-600' : 'text-blue-600')}>{msg.status}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                               <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${msg.progress}%` }} 
                                    className={cn("h-full rounded-full", msg.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-500')} 
                                />
                           </div>
                       </div>
                   ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-medium text-slate-400">
                    <span>Relay Summary</span>
                    <span>142 Messages Today</span>
                </div>
              </Card>

              {/* Quick Summary Card */}
              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white flex flex-col gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Gateway</p>
                        <p className="text-xs font-bold text-slate-900">MSG91 Enterprise</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 opacity-60">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Admin</p>
                        <p className="text-xs font-bold text-slate-900">HOD Analytics</p>
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}