"use client";

import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Lightbulb,
  Heart,
  Calendar,
  Mail,
  Smartphone,
  Info,
  ChevronRight,
  Bell,
  CreditCard,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    getStudentPerformance,
    getParentInsights
} from "@/lib/marks-calculations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { academicService } from "@/services/academic";

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [childData, setChildData] = useState<any>(null);

  useEffect(() => {
    const loadParentData = async () => {
      try {
        setLoading(true);
        const feeds = await academicService.getNotifications();
        setNotifications(feeds || []);
        
        // Mocking child profile with current real calculations
        const mockChild = {
            name: "Alex Johnson",
            class: "B.Tech Computer Science - Year 2",
            marks: { attendancePercentage: 72, cia1: 2.0, cia2: 1.5, test1: 28, test2: 30, assignment: 8.5 }
        };
        setChildData(mockChild);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadParentData();
  }, []);

  if (loading || !childData) return <div className="p-20 text-center animate-pulse font-black text-slate-200 uppercase tracking-widest">Bridging Academic Systems...</div>;

  const performance = getStudentPerformance(childData.marks);
  const insights = getParentInsights(childData.marks.attendancePercentage, performance.finalMarks);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full pb-20 pt-8 max-w-5xl mx-auto px-4 md:px-0">
        
        {/* Hero Section */}
        <section className="mb-10">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative p-10 lg:p-14 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/10 blur-3xl opacity-50" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guardian Access Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter">{childData.name}</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{childData.class}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                        <StatusBadge status={insights.status} />
                        <div className="px-6 py-2.5 rounded-[1.5rem] bg-white text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl">
                           IA Score: {performance.finalMarks}/20
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-12 border-l border-white/5 pl-12 hidden lg:grid">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Observation Rate</p>
                        <p className={cn("text-5xl font-black italic", insights.status === 'risk' ? 'text-rose-500' : 'text-emerald-500')}>
                            {childData.marks.attendancePercentage}%
                        </p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cycle Milestone</p>
                        <p className="text-5xl font-black italic text-white">#04</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Feed Section */}
            <div className="lg:col-span-2 space-y-10">
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Institutional Feed
                        </h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Live Stream</span>
                    </div>
                    
                    <div className="space-y-6">
                        <AnimatePresence>
                            {notifications.length > 0 ? (
                                notifications.map((note, idx) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="p-8 border-slate-100 rounded-[2.5rem] hover:shadow-xl transition-all border border-slate-100 group">
                                            <div className="flex gap-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                                    note.type === 'finance' ? "bg-blue-600 text-white shadow-blue-100" : "bg-emerald-600 text-white shadow-emerald-100"
                                                )}>
                                                    {note.type === 'finance' ? <CreditCard className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{note.title}</h4>
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Recently</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{note.message}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="p-12 text-center rounded-[3rem] bg-slate-50 border border-slate-100 italic font-bold text-slate-300 text-sm">
                                    No active institutional alerts for your section yet.
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-10">
                <Card className="p-8 rounded-[3rem] bg-slate-50 border-none shadow-sm">
                    <h3 className="text-xs font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        Guardian Alerts
                    </h3>
                    <div className="space-y-8">
                        {insights.status === 'risk' && (
                           <div className="p-6 rounded-[2rem] bg-white border border-rose-100 shadow-xl shadow-rose-100/20">
                                <p className="text-xs font-black text-rose-600 uppercase tracking-tight mb-2">Threshold Warning</p>
                                <p className="text-[13px] text-slate-500 font-medium">Child is currently below 75% regularity. This may block examination access.</p>
                           </div>
                        )}
                        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/20">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-tight mb-2">Academic Wellness</p>
                            <p className="text-[13px] text-slate-500 font-medium italic">IA scores are trending higher than previous cycle average.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <div className={cn(
            "px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl",
            status === 'risk' ? "bg-rose-500 text-white shadow-rose-200" : "bg-emerald-500 text-white shadow-emerald-200"
        )}>
            {status === 'risk' ? "At Academic Risk" : "Stability Locked"}
        </div>
    );
}

        {/* Alert System */}
        <AnimatePresence>
            {insights.alert && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                    <Card className={cn(
                        "p-6 rounded-[2rem] border-none shadow-xl flex items-start gap-4 ring-1",
                        insights.status === 'risk' ? "bg-rose-50 ring-rose-200" : "bg-amber-50 ring-amber-200"
                    )}>
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                            insights.status === 'risk' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                        )}>
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-bold", insights.status === 'risk' ? "text-rose-900" : "text-amber-900")}>
                                Attention Required
                            </h3>
                            <p className={cn("text-sm font-medium mt-1 leading-relaxed", insights.status === 'risk' ? "text-rose-700/80" : "text-amber-700/80")}>
                                {insights.alert}
                            </p>
                            <button className={cn(
                                "mt-4 text-xs font-bold px-4 py-2 rounded-xl transition-all",
                                insights.status === 'risk' ? "bg-rose-900 text-white hover:bg-rose-800" : "bg-amber-900 text-white hover:bg-amber-800"
                            )}>
                                Schedule Call with Advisor
                            </button>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Performance Breakdown */}
                <Card className="p-8 border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Academic Standing</h3>
                            <p className="text-sm text-slate-400 font-medium">Internal assessment breakdown</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>

                    <div className="space-y-8">
                        <ParentProgressItem label="Consistent Presence" value={performance.attendanceMarks} max={5} color="bg-rose-400" icon={Calendar} />
                        <ParentProgressItem label="Continuous Assessments" value={performance.ciaTotal} max={5} color="bg-indigo-400" icon={CheckCircle} />
                        <ParentProgressItem label="Term Weightage" value={performance.testScore} max={10} color="bg-amber-400" icon={BarChart2} />
                    </div>
                </Card>

                {/* Smart Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-indigo-50 border-none rounded-[2rem] flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm shrink-0">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Smart Insight</p>
                            <p className="text-sm font-bold text-indigo-900 leading-tight">{insights.insight}</p>
                        </div>
                    </Card>
                    <Card className="p-6 bg-slate-50 border-none rounded-[2rem] flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl text-slate-600 shadow-sm shrink-0">
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next milestone</p>
                            <p className="text-sm font-bold text-slate-900 leading-tight">Term End Examination starts in 14 days</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Attendance Trend (Right Column) */}
            <div className="space-y-8 h-full">
                <Card className="p-8 border-slate-100 rounded-[2.5rem] bg-white shadow-sm h-full flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Term Stability</h3>
                        <p className="text-sm text-slate-400 font-medium">Monthly engagement</p>
                    </div>

                    <div className="flex-1 min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceHistory}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="#f43f5e" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorTrend)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 space-y-4 pt-6 border-t border-slate-50">
                        <ContactAction icon={Mail} label="Message Class Teacher" />
                        <ContactAction icon={Smartphone} label="Call Administrative Office" />
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatusBadge({ status }: { status: 'good' | 'warning' | 'risk' }) {
    const config = {
        good: { color: 'bg-emerald-500', label: 'Good Standing', icon: CheckCircle },
        warning: { color: 'bg-amber-500', label: 'Needs Attention', icon: AlertTriangle },
        risk: { color: 'bg-rose-500', label: 'At Academic Risk', icon: ShieldAlert },
    };
    const active = config[status];
    return (
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-lg shadow-black/5", active.color)}>
            <active.icon className="w-3.5 h-3.5" />
            {active.label}
        </div>
    );
}

function ParentProgressItem({ label, value, max, color, icon: Icon }: any) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white p-1", color)}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{label}</span>
                </div>
                <div className="text-sm font-black text-slate-900">
                    {value} <span className="text-slate-300 font-bold">/ {max}</span>
                </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={cn("h-full rounded-full shadow-sm", color)}
                />
            </div>
        </div>
    );
}

function ContactAction({ icon: Icon, label }: any) {
    return (
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">{label}</span>
        </button>
    );
}

function BarChart2(props: any) {
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
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    )
  }
