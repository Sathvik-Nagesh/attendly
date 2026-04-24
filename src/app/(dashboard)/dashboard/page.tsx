"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Users, UserX, UserCheck, TrendingUp, Clock, CheckCircle, FileText, FileSpreadsheet, BarChart3, ArrowRight, MessageSquare, AlertCircle, Loader2, Shield, Bell, BookOpen, Trophy, Award as AwardIcon, Medal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { academicService } from "@/services/academic";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useStudents, useClasses, useDashboardStats, useNotifications } from "@/hooks/use-academic";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Import export libraries

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return profile;
    }
  });

  const { data: pendingFaculty = [] } = useQuery({
    queryKey: ['pending-faculty'],
    queryFn: () => academicService.getPendingFaculty(),
    enabled: userProfile?.role === 'ADMIN'
  });

  const { data: stats, isLoading, refetch } = useDashboardStats(timeframe);

  const handleRefresh = async () => {
    await refetch();
    toast.success("Registry Refreshed", {
        description: "Dashboard stats have been updated to the latest state."
    });
  };


  const { data: students = [] } = useQuery({
    queryKey: ['all-students-export'],
    queryFn: () => academicService.getAllStudentsUnpaginated(),
    enabled: !!userProfile
  });

  const handleApprove = async (id: string, name: string) => {
      try {
          await academicService.approveFaculty(id);
          toast.success(`Identity Verified: ${name}`, {
              description: "Faculty advisor has been granted administrative access."
          });
      } catch (err) {
          toast.error("Verification system failure.");
      }
  };

  const activeData = stats?.weeklyTrend || [];

  const handleExportPDF = () => {
    setIsGenerating('PDF');
    toast.loading("Generating Defaulter List...");

    setTimeout(() => {
        const doc = new jsPDF() as any;
        
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); 
        doc.text("Attendex College Portal", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("Official Defaulter List - Attendance below 75%", 105, 30, { align: "center" });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 38, { align: "center" });
        
        doc.setDrawColor(226, 232, 240);
        doc.line(20, 45, 190, 45);

        const defaulterData = students
            .filter((s: any) => (s.attendance_percentage || 0) < 75)
            .map((s: any, i: number) => [
                (i + 1).toString(),
                s.name,
                s.roll_number,
                s.department || "N/A",
                `${s.attendance_percentage || 0}%`
            ]);

        autoTable(doc, {
            startY: 55,
            head: [['#', 'Student Name', 'Roll Number', 'Department', 'Attendance']],
            body: defaulterData.length > 0 ? defaulterData : [["-", "No defaulters found", "-", "-", "-"]],
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 5 },
        });

        doc.save("Attendex_defaulter_list.pdf");
        setIsGenerating(null);
        toast.dismiss();
        toast.success("Defaulter List (PDF) exported successfully!");
    }, 1500);
  };

  const handleExportExcel = () => {
    setIsGenerating('XLS');
    toast.loading("Compiling Monthly Ledger...");

    setTimeout(() => {
        const ledgerData = students.map((s: any) => ({
            id: s.id,
            name: s.name,
            roll: s.roll_number,
            department: s.department || "N/A",
            attendance: `${s.attendance_percentage || 0}%`,
            status: (s.attendance_percentage || 0) < 75 ? "Risk" : "Safe"
        }));

        const worksheet = XLSX.utils.json_to_sheet(ledgerData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Ledger");
        
        XLSX.utils.sheet_add_aoa(worksheet, [["ID", "Student Name", "Roll Number", "Department", "Attendance %", "Status"]], { origin: "A1" });

        XLSX.writeFile(workbook, "Attendex_monthly_ledger.xlsx");
        setIsGenerating(null);
        toast.dismiss();
        toast.success("Monthly Ledger (XLS) exported successfully!");
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Dashboard" />
        
        <div className="flex-1 py-8 space-y-6">



          {/* Admin Approval Queue */}
          <AnimatePresence>
              {userProfile?.role === 'ADMIN' && pendingFaculty.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <Card className="p-8 border-amber-200 bg-amber-50/50 rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                             <Shield className="w-20 h-20 text-amber-500/10 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                Pending Institutional Recognitions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingFaculty.map((faculty) => (
                                    <div key={faculty.id} className="p-5 bg-white rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{faculty.full_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{faculty.email}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleApprove(faculty.id, faculty.full_name)}
                                            className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-200 hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <UserCheck className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                  </motion.div>
              )}
          </AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-1">
            <StatCard
              title="Students Enrolled"
              value={isLoading ? "..." : (stats?.totalStudents || 0)}
              label="Academic Population"
              icon={Users}
              delay={0.1}
              color="blue"
            />
            <StatCard
              title="Total Modules"
              value={isLoading ? "..." : (stats?.totalClasses || 0)}
              label="Active Units"
              icon={FileText}
              delay={0.2}
              color="emerald"
            />
            <StatCard
              title="Absentees Today"
              value={isLoading ? "..." : (stats?.absenteesToday || 0)}
              label="Pending Alerts"
              icon={UserX}
              delay={0.3}
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                
                <div className="h-[300px] w-full mt-4" style={{ minHeight: '300px' }}>
                  {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} aspect={2}>
                    <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                      <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={32} />
                      <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 4, 4]} barSize={8} />
                    </BarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-slate-50 rounded-xl animate-pulse" />
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Exports</h3>
                  <div className="space-y-3">
                    <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isGenerating !== null}
                        className="w-full justify-between h-12 rounded-lg border-slate-100 font-semibold group"
                        onClick={handleExportPDF}
                    >
                        <div className="flex items-center gap-2">
                             {isGenerating === 'PDF' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-rose-500" />}
                             <span>Defaulter List (PDF)</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isGenerating !== null}
                        className="w-full justify-between h-12 rounded-lg border-slate-100 font-semibold group"
                        onClick={handleExportExcel}
                    >
                        <div className="flex items-center gap-2">
                             {isGenerating === 'XLS' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                             <span>Monthly Sheet (XLS)</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Institutional Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 rounded-lg border-slate-100 font-semibold gap-2 justify-start px-4 hover:bg-slate-50 transition-all"
                        onClick={() => router.push('/results/manage')}
                    >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>CIA Entry</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 rounded-lg border-slate-100 font-semibold gap-2 justify-start px-4 hover:bg-slate-50 transition-all"
                        onClick={() => router.push('/sports')}
                    >
                        <Trophy className="w-4 h-4 text-emerald-600" />
                        <span>Sports</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 rounded-lg border-slate-100 font-semibold gap-2 justify-start px-4 hover:bg-slate-50 transition-all"
                        onClick={() => router.push('/leaderboard')}
                    >
                        <AwardIcon className="w-4 h-4 text-amber-600" />
                        <span>Leaderboard</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 rounded-lg border-slate-100 font-semibold gap-2 justify-start px-4 hover:bg-slate-50 transition-all"
                        onClick={() => router.push('/notifications')}
                    >
                        <Bell className="w-4 h-4 text-rose-600" />
                        <span>Alerts</span>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {(stats?.recentActivity || []).map((activity: any) => (
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
                        {(!stats?.recentActivity?.length) && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No recent activity</p>
                        )}
                    </div>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 border-slate-200 shadow-sm rounded-xl bg-white">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold text-slate-900">SMS Outbox</h3>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase">Online</span>
                   </div>
                </div>

                <div className="space-y-5">
                   {stats?.absenteesToday === 0 ? (
                       <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                           <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3 opacity-30" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Clear</p>
                       </div>
                   ) : (
                       <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{stats?.absenteesToday} Alerts Queued</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Faculty Execution</p>
                                </div>
                            </div>
                       </div>
                   )}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-medium text-slate-400">
                    <span>Relay Summary</span>
                    <span>142 Messages Today</span>
                </div>
              </Card>

              <Card className="p-8 border-slate-200 shadow-sm rounded-xl bg-white space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Departmental Pulse</h3>
                     <BarChart3 className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="space-y-6">
                      {stats?.departmentPulse?.map((dept: any) => (
                          <div key={dept.name} className="space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                                  <span>{dept.name}</span>
                                  <span className="text-blue-600">{dept.percentage}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: `${dept.percentage}%` }} 
                                      className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-500/10" 
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
