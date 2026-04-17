"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Clock, User, MapPin, Calendar, UploadCloud, RefreshCcw, Sparkles, FileSpreadsheet } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { academicService } from "@/services/academic";
import { supabase } from "@/lib/supabase";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableProps {
    isParentView?: boolean;
    isTeacherView?: boolean;
}

export default function StudentTimetable({ isParentView = false, isTeacherView = false }: TimetableProps) {
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    const loadSchedule = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let classId = null;
            if (isParentView) {
                const student = await academicService.getStudentByParentEmail(user.email!);
                classId = student?.class_id;
            } else {
                const { data: profile } = await supabase.from('profiles').select('class_id').eq('id', user.id).single();
                classId = profile?.class_id;
            }

            if (!classId && !isTeacherView) {
                setSchedule([]);
                setLoading(false);
                return;
            }

            let query = supabase
                .from('timetables')
                .select('*, classes(name, section)')
                .eq('day_of_week', selectedDay)
                .order('start_time', { ascending: true });

            if (classId) {
                query = query.eq('class_id', classId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setSchedule(data || []);

            const [examData, noteData] = await Promise.all([
                supabase.from('exams').select('*').limit(1).order('exam_date', { ascending: true }),
                supabase.from('notifications').select('*').limit(3).order('created_at', { ascending: false })
            ]);
            setExams(examData.data || []);
            setAlerts(noteData.data || []);

        } catch (err) {
            toast.error("Failed to sync institutional schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedule();
    }, [selectedDay]);

    const handleImportCSV = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        toast.loading("Analyzing and ingesting academic schedule...");
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter(l => l.trim() !== "");
                const payload = lines.slice(1).map((line) => {
                    const [className, section, day, sub, teacher, room, start, end] = line.split(',').map(v => v.trim());
                    return {
                        day_of_week: day,
                        subject: sub,
                        teacher_name: teacher,
                        room_number: room,
                        start_time: start,
                        end_time: end,
                        class_id: null
                    };
                });

                const { data: clsData } = await supabase.from('classes').select('id, name, section');
                const finalPayload = payload.map(p => {
                    const matchingClass = clsData?.find(c => c.name.toLowerCase().includes(p.subject.toLowerCase()) || c.section === 'A');
                    return { ...p, class_id: matchingClass?.id };
                }).filter(p => p.class_id);

                const { error } = await supabase.from('timetables').insert(finalPayload);
                if (error) throw error;

                toast.dismiss();
                toast.success(`Synchronized ${finalPayload.length} sessions to institutional grid`);
                loadSchedule();
            } catch (err) {
                toast.dismiss();
                toast.error("Cloud ingestion failed");
            }
        };
        reader.readAsText(file);
    };

    if (loading && schedule.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
                <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Institutional Calendar</p>
            </div>
        );
    }

    return (
        <PageTransition>
            {/* Outer wrapper: clips horizontal overflow, fills height */}
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-50">
                <Header title={isParentView ? "Academic Coordinates" : (isTeacherView ? "Logistics Command" : "My Schedule")} />

                {/* Main content: consistent padding on all breakpoints */}
                <div className="flex-1 w-full px-4 md:px-8 lg:px-10 py-6 md:py-10 space-y-6 md:space-y-8">

                    {/* ── Weekly Day Selector Card ── */}
                    <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 md:p-8">
                        {/* Day pills: scrollable row on mobile, centered */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
                            {DAYS.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        "h-10 px-4 md:px-7 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 shrink-0 snap-center",
                                        selectedDay === day
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-[1.04]"
                                            : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-700"
                                    )}
                                >
                                    {/* Short label on mobile, full on md+ */}
                                    <span className="md:hidden">{day.slice(0, 3)}</span>
                                    <span className="hidden md:inline">{day}</span>
                                </button>
                            ))}
                        </div>

                        {/* Teacher CSV tools — stacked on mobile */}
                        {isTeacherView && (
                            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required CSV Schema:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['class', 'section', 'day', 'subject', 'faculty', 'room', 'start', 'end'].map(col => (
                                            <span key={col} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[8px] font-bold text-slate-500 lowercase">{col}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        className="h-11 flex-1 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-slate-50 active:scale-95"
                                        onClick={() => {
                                            const content = "class,section,day,subject,faculty,room,start,end\nBCA,A,Monday,Web Design,Dr. Smith,Lab-1,09:00:00,10:00:00";
                                            const blob = new Blob([content], { type: 'text/csv' });
                                            const a = document.createElement('a');
                                            a.href = window.URL.createObjectURL(blob);
                                            a.download = 'attendly_schedule_template.csv';
                                            a.click();
                                        }}
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                        Template
                                    </Button>
                                    <label className="h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer active:scale-95">
                                        <UploadCloud className="w-4 h-4" />
                                        Upload CSV
                                        <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Main Grid: Schedule + Sidebar ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                        {/* Session Feed — 2/3 width on desktop */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedDay}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.18 }}
                                    className="space-y-4"
                                >
                                    {schedule.map((slot: any) => (
                                        <Card key={slot.id} className="relative overflow-hidden border-none ring-1 ring-slate-100 rounded-2xl md:rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                            {/* Accent bar — subject colour */}
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl", {
                                                "bg-blue-500": slot.color_code === 'blue',
                                                "bg-indigo-500": slot.color_code === 'indigo',
                                                "bg-rose-500": slot.color_code === 'rose',
                                                "bg-emerald-500": slot.color_code === 'emerald',
                                                "bg-amber-500": slot.color_code === 'amber',
                                                "bg-slate-400": !slot.color_code || slot.color_code === 'slate',
                                            })} />

                                            <div className="pl-5 pr-4 py-4 md:px-8 md:py-6">
                                                <div className="flex items-start gap-4">
                                                    {/* Time block */}
                                                    <div className="shrink-0 flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl py-2 px-1">
                                                        <Clock className="w-3 h-3 text-slate-400 mb-1" />
                                                        <span className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tight">{slot.start_time.slice(0, 5)}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase">–{slot.end_time.slice(0, 5)}</span>
                                                    </div>

                                                    {/* Subject info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <h3 className="text-sm md:text-base font-black text-slate-900 italic uppercase tracking-tight truncate">{slot.subject}</h3>
                                                            <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-[8px] font-black text-slate-500 rounded-md uppercase tracking-widest">{slot.classes?.section || 'A'}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3 text-blue-400" />{slot.teacher_name}</span>
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-400" />{slot.room_number}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action row */}
                                                <div className="flex gap-2 mt-3">
                                                    <Button variant="outline" className="h-9 flex-1 rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">
                                                        Resources
                                                    </Button>
                                                    {isTeacherView && (
                                                        <Button variant="ghost" className="h-9 flex-1 rounded-xl text-rose-500 text-[9px] font-black uppercase tracking-widest hover:bg-rose-50">
                                                            Postpone
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {schedule.length === 0 && (
                                        <div className="py-20 text-center">
                                            <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.3em] italic">
                                                No sessions found for <span className="text-slate-500">{selectedDay}</span>
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Right Sidebar: Exam + Alerts ── */}
                        <div className="space-y-5">
                            {/* Final Exam Card */}
                            <Card className="border-none rounded-2xl md:rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                                <div className="relative z-10 p-5 md:p-7">
                                    <h3 className="text-base font-black italic uppercase tracking-tight mb-0.5">Final Exam</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-5">Institutional Milestone</p>
                                    {exams.length > 0 ? (
                                        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-black text-blue-300 uppercase tracking-tight truncate">{exams[0].subject}</span>
                                                <span className="text-[7px] font-black bg-rose-600 px-2 py-1 rounded-full uppercase tracking-widest animate-pulse shrink-0">Critical</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-black tracking-tight uppercase italic">{new Date(exams[0].exam_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-8 text-slate-600 text-[10px] font-black uppercase tracking-widest italic">No Examinations Found</p>
                                    )}
                                </div>
                            </Card>

                            {/* Live Intelligence Card */}
                            <Card className="border-none rounded-2xl md:rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                                <div className="p-5 md:p-7">
                                    <h3 className="text-[10px] font-black text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Live Intelligence
                                    </h3>
                                    <div className="space-y-4">
                                        {alerts.map((alert) => (
                                            <div key={alert.id} className="flex gap-3 items-start group cursor-pointer hover:translate-x-0.5 transition-transform">
                                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-slate-900 group-hover:bg-blue-600 transition-colors" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug uppercase tracking-tight">{alert.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{new Date(alert.created_at).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {alerts.length === 0 && (
                                            <p className="text-center py-8 text-slate-300 font-black uppercase text-[9px] tracking-widest italic">All Nodes Silent</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>{/* /grid */}
                </div>{/* /main content */}
            </div>{/* /outer wrapper */}
        </PageTransition>
    );
}
