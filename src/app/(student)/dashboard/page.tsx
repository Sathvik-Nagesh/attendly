"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  CheckCircle, 
  BookOpen, 
  TrendingUp, 
  GraduationCap, 
  FileCheck,
  ClipboardList
} from "lucide-react";
import { motion } from "framer-motion";
import { 
    calculateAttendanceMarks, 
    calculateCIAMarks, 
    calculateTestMarks, 
    calculateFinalMarks,
    getStudentPerformance
} from "@/lib/marks-calculations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

// Mock Student Data
const studentData = {
    name: "Alex Johnson",
    roll: "CS-2024-001",
    marks: {
        attendancePercentage: 88,
        cia1: 2.5,
        cia2: 2.0,
        test1: 32, // out of 40
        test2: 35, // out of 40
        assignment: 9.5
    }
};

const attendanceHistory = [
  { name: "Mon", rate: 85 },
  { name: "Tue", rate: 88 },
  { name: "Wed", rate: 82 },
  { name: "Thu", rate: 90 },
  { name: "Fri", rate: 88 },
];

const StatCard = ({ title, value, max, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="p-6 border-slate-200 shadow-sm rounded-3xl bg-white group hover:shadow-md transition-shadow relative overflow-hidden">
      <div className={cn("absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500", color)} />
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color.replace('bg-', 'bg-').replace('-500', '-50'), color.replace('bg-', 'text-'))}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
            {max && <span className="text-sm font-bold text-slate-400">/ {max}</span>}
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function StudentDashboard() {
  const performance = getStudentPerformance(studentData.marks);
  const isLowAttendance = studentData.marks.attendancePercentage < 75;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20">
        <header className="py-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Academic Portal</h1>
                <p className="text-slate-500 font-medium">Welcome back, {studentData.name}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900">{studentData.roll}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">B.Tech CS - Year 2</p>
                </div>
            </div>
        </header>
        
        <div className="space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Attendance %"
              value={`${studentData.marks.attendancePercentage}%`}
              icon={Activity}
              color="bg-blue-500"
              delay={0.1}
            />
            <StatCard
              title="Attendance Marks"
              value={performance.attendanceMarks}
              max={5}
              icon={CheckCircle}
              color="bg-emerald-500"
              delay={0.2}
            />
            <StatCard
              title="CIA Score"
              value={performance.ciaTotal}
              max={5}
              icon={BookOpen}
              color="bg-purple-500"
              delay={0.3}
            />
            <StatCard
              title="Test Weightage"
              value={performance.testScore}
              max={10}
              icon={GraduationCap}
              color="bg-orange-500"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Final Marks Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 space-y-8"
            >
              <Card className="p-8 border-none bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Total Internal Assessment</p>
                        <h2 className="text-6xl font-black tracking-tight">{performance.finalMarks} <span className="text-2xl text-slate-500 font-bold">/ 20</span></h2>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            Above class average (16.2)
                        </div>
                    </div>
                    <div className="flex-1 max-w-xs space-y-4">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Progress</span>
                            <span>{Math.round((performance.finalMarks/20)*100)}%</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(performance.finalMarks/20)*100}%` }}
                                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                            />
                        </div>
                    </div>
                </div>
              </Card>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Internal Breakdown */}
                 <Card className="p-6 border-slate-100 rounded-[2rem] bg-white shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        Component Breakdown
                    </h3>
                    <div className="space-y-6">
                        <BreakdownItem label="Attendance" value={performance.attendanceMarks} max={5} color="bg-emerald-500" />
                        <BreakdownItem label="CIA Assessments" value={performance.ciaTotal} max={5} color="bg-purple-500" />
                        <BreakdownItem label="Internal Tests" value={performance.testScore} max={10} color="bg-orange-500" />
                    </div>
                 </Card>

                 {/* Assignments */}
                 <Card className="p-6 border-slate-100 rounded-[2rem] bg-white shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        Latest Assignments
                    </h3>
                    <div className="space-y-4">
                        <AssignmentRow title="Data Structures Lab" marks="9.5/10" status="Graded" />
                        <AssignmentRow title="App Development Project" marks="-" status="Pending" />
                        <AssignmentRow title="Theory Quiz #4" marks="8.0/10" status="Graded" />
                    </div>
                 </Card>
              </div>
            </motion.div>

            {/* Attendance Trend Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-8"
            >
              <Card className="p-6 border-slate-100 rounded-[2.5rem] bg-white shadow-sm h-full flex flex-col">
                 <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">Attendance Stability</h3>
                    <p className="text-sm text-slate-400 font-medium">Real-time daily presence trend</p>
                 </div>
                 
                 <div className="flex-1 min-h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceHistory}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                dy={10} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="rate" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorRate)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 {isLowAttendance && (
                    <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-900">Low Attendance Warning</p>
                            <p className="text-xs text-red-600">Your attendance is below 75%. You may experience issues in final hall ticket generation.</p>
                        </div>
                    </div>
                 )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function BreakdownItem({ label, value, max, color }: any) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-slate-900">{value} <span className="text-slate-300">/ {max}</span></span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", color)}
                />
            </div>
        </div>
    );
}

function AssignmentRow({ title, marks, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
            <div>
                <p className="text-sm font-bold text-slate-700">{title}</p>
                <p className={cn("text-[10px] font-extrabold uppercase", status === 'Graded' ? 'text-emerald-500' : 'text-slate-400')}>{status}</p>
            </div>
            <div className="text-sm font-black text-slate-900">{marks}</div>
        </div>
    );
}

function AlertCircle(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    )
  }
