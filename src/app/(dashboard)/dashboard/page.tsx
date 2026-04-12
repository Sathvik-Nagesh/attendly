"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Users, UserX, UserCheck, TrendingUp, Clock, CheckCircle, FileText, FileSpreadsheet, BarChart3, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  { id: "1", roll: "CS-02", parent: "Mr. Cooper", status: "Sending", progress: 65, time: "Just now" },
  { id: "2", roll: "CS-14", parent: "Dr. Sharma", status: "Queued", progress: 0, time: "Queued" },
  { id: "3", roll: "CS-28", parent: "Mrs. Davis", status: "Delivered", progress: 100, time: "2m ago" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-emerald-600 flex items-center justify-between gap-4">
            Present: <span>{payload[0].value}</span>
          </p>
          <p className="text-sm font-bold text-red-500 flex items-center justify-between gap-4">
            Absent: <span>{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const recentActivity = [
  { id: 1, text: "Computer Science 101 marked by Alex", time: "10 mins ago", type: "success" },
  { id: 2, text: "Physics 202 - 3 absent students notified", time: "1 hour ago", type: "alert" },
  { id: 3, text: "English Lit 303 marked by Sarah", time: "2 hours ago", type: "success" },
];

const StatCard = ({ title, value, label, icon: Icon, delay = 0, trendClass = "text-emerald-600", trendBg = "bg-emerald-50" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="p-6 border-slate-200 shadow-sm rounded-2xl hover:shadow-md transition-shadow bg-white relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${trendBg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trendBg} ${trendClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
        <TrendingUp className={`w-4 h-4 ${trendClass}`} />
        <span className={trendClass}>{label}</span>
        <span className="text-slate-400">vs last week</span>
      </div>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const activeData = timeframe === 'week' ? weeklyData : monthlyData;

  const generateReport = (name: string) => {
    setIsGenerating(name);
    setTimeout(() => {
      setIsGenerating(null);
      toast.success(`${name} generated!`, {
        description: "Your report has been downloaded to your system."
      });
    }, 2000);
  };
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Dashboard" />
        
        <div className="flex-1 py-8 space-y-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Students"
              value="248"
              label="+4 new"
              icon={Users}
              delay={0.1}
              trendBg="bg-blue-50"
              trendClass="text-blue-600"
            />
            <StatCard
              title="Present Today"
              value="231"
              label="93.1%"
              icon={UserCheck}
              delay={0.2}
              trendBg="bg-emerald-50"
              trendClass="text-emerald-600"
            />
            <StatCard
              title="Absent Today"
              value="17"
              label="-2 from yday"
              icon={UserX}
              delay={0.3}
              trendBg="bg-red-50"
              trendClass="text-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white h-[450px] flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Attendance Trend</h3>
                    <p className="text-sm text-slate-500">View performance over {timeframe}</p>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => setTimeframe('week')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Week
                    </button>
                    <button 
                      onClick={() => setTimeframe('month')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeframe === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-[300px] w-full min-w-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                      <Area 
                        type="monotone" 
                        dataKey="present" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorPresent)" 
                        animationDuration={1000}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="absent" 
                        stroke="#ef4444" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        fillOpacity={1} 
                        fill="url(#colorAbsent)" 
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white h-auto flex flex-col">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-900">One-Click Reports</h3>
                  <p className="text-sm text-slate-500">Fast export for college administration</p>
                </div>
                <div className="space-y-3 flex-1">
                   <button 
                    disabled={isGenerating !== null}
                    onClick={() => generateReport('Defaulter List')}
                    className="flex items-center justify-between w-full p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group disabled:opacity-50"
                  >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                         {isGenerating === 'Defaulter List' ? <Clock className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                       </div>
                       <div className="text-left">
                         <p className="text-sm font-semibold text-slate-900">
                           {isGenerating === 'Defaulter List' ? 'Generating PDF...' : 'Defaulter List (PDF)'}
                         </p>
                         <p className="text-xs text-slate-400">Students below 75% attendance</p>
                       </div>
                     </div>
                     {isGenerating !== 'Defaulter List' && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />}
                   </button>

                   <button 
                    disabled={isGenerating !== null}
                    onClick={() => generateReport('Monthly Sheet')}
                    className="flex items-center justify-between w-full p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group disabled:opacity-50"
                  >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         {isGenerating === 'Monthly Sheet' ? <Clock className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                       </div>
                       <div className="text-left">
                         <p className="text-sm font-semibold text-slate-900">
                           {isGenerating === 'Monthly Sheet' ? 'Compiling XLS...' : 'Monthly Sheet (XLS)'}
                         </p>
                         <p className="text-xs text-slate-400">Complete attendance ledger</p>
                       </div>
                     </div>
                     {isGenerating !== 'Monthly Sheet' && <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />}
                   </button>

                   <button className="flex items-center justify-between w-full p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group opacity-60 cursor-not-allowed">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                         <BarChart3 className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                         <p className="text-sm font-semibold text-slate-900">Department Overview</p>
                         <p className="text-xs text-slate-400">HOD Level Analytics</p>
                       </div>
                     </div>
                   </button>
                </div>
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white h-[200px] flex flex-col">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="space-y-4 flex-1 overflow-auto pr-2">
                  {recentActivity.map((activity, i) => (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="relative mt-1">
                        <div className={`w-2 h-2 rounded-full z-10 relative ring-4 ring-white ${activity.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800">{activity.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white h-auto flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Live SMS Outbox</h3>
                    <p className="text-sm text-slate-500">Real-time gateway status</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                
                <div className="space-y-4 flex-1">
                  {SMS_QUEUE.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-700">{msg.roll} → {msg.parent}</span>
                          <span className={cn(
                             msg.status === 'Delivered' ? 'text-emerald-600' :
                             msg.status === 'Sending' ? 'text-blue-600' : 'text-slate-400'
                          )}>
                             {msg.status}
                          </span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${msg.progress}%` }}
                            transition={{ duration: 1 }}
                            className={cn(
                               "h-full rounded-full",
                               msg.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-600'
                            )}
                          />
                       </div>
                       <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>MSG91 Gateway</span>
                          <span>{msg.time}</span>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Total Today</span>
                        <span className="font-bold text-slate-900">142 Messages</span>
                    </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
