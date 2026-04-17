"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import {
    Clock, User, MapPin, Calendar,
    UploadCloud, RefreshCcw, Sparkles, FileSpreadsheet
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { academicService } from "@/services/academic";
import { supabase } from "@/lib/supabase";

// ── Timetable-specific types ────────────────────────────────────────
interface TimetableSlot {
    id: string;
    day_of_week: string;
    subject: string;
    teacher_name: string;
    room_number: string;
    start_time: string;
    end_time: string;
    color_code?: string;
    class_id: string;
    classes?: { name: string; section: string };
}

interface Exam {
    id: string;
    subject: string;
    exam_date: string;
    room_number?: string;
}

interface Notification {
    id: string;
    title: string;
    created_at: string;
}

interface TimetableProps {
    isParentView?: boolean;
    isTeacherView?: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
type Day = typeof DAYS[number];

// ───────────────────────────────────────────────────────────────────
export default function StudentTimetable({ isParentView = false, isTeacherView = false }: TimetableProps) {
    const [selectedDay, setSelectedDay] = useState<Day>("Monday");
    const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<Exam[]>([]);
    const [alerts, setAlerts] = useState<Notification[]>([]);

    // ── Sidebar data: fetch ONCE ──────────────────────────────────
    useEffect(() => {
        const fetchSidebar = async () => {
            const [examRes, noteRes] = await Promise.all([
                supabase.from('exams').select('*').limit(1).order('exam_date', { ascending: true }),
                supabase.from('notifications').select('*').limit(3).order('created_at', { ascending: false })
            ]);
            setExams((examRes.data as Exam[]) || []);
            setAlerts((noteRes.data as Notification[]) || []);
        };
        fetchSidebar();
    }, []);

    // ── Schedule: re-fetch on day change ─────────────────────────
    const loadSchedule = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let classId: string | null = null;
            if (isParentView) {
                const student = await academicService.getStudentByParentEmail(user.email!);
                classId = student?.class_id ?? null;
            } else {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('class_id')
                    .eq('id', user.id)
                    .single();
                classId = profile?.class_id ?? null;
            }

            if (!classId && !isTeacherView) {
                setSchedule([]);
                return;
            }

            let query = supabase
                .from('timetables')
                .select('*, classes(name, section)')
                .eq('day_of_week', selectedDay)
                .order('start_time', { ascending: true });

            if (classId) query = query.eq('class_id', classId);

            const { data, error } = await query;
            if (error) throw error;
            setSchedule((data as TimetableSlot[]) || []);
        } catch {
            toast.error("Failed to sync schedule");
        } finally {
            setLoading(false);
        }
    }, [selectedDay, isParentView, isTeacherView]);

    useEffect(() => { loadSchedule(); }, [loadSchedule]);

    // ── CSV Import (fixed class matching) ────────────────────────
    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        toast.loading("Ingesting academic schedule...");
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').filter(l => l.trim() !== "");
                if (lines.length < 2) throw new Error("File is empty");
                const rows = lines.slice(1).map(line => {
                    const c = line.split(',').map(v => v.trim());
                    return { className: c[0], section: c[1], day_of_week: c[2], subject: c[3], teacher_name: c[4], room_number: c[5], start_time: c[6], end_time: c[7] };
                });
                const { data: clsData } = await supabase.from('classes').select('id, name, section');
                const payload = rows.map(row => {
                    const matched = clsData?.find(
                        c => c.name.toLowerCase() === row.className.toLowerCase()
                          && c.section.toLowerCase() === row.section.toLowerCase()
                    );
                    if (!matched) return null;
                    return { ...row, class_id: matched.id };
                }).filter(Boolean);
                if (!payload.length) throw new Error("No rows matched. Check class names & sections.");
                const { error } = await supabase.from('timetables').insert(payload);
                if (error) throw error;
                toast.dismiss();
                toast.success(`Synchronized ${payload.length} sessions`);
                loadSchedule();
            } catch (err: any) {
                toast.dismiss();
                toast.error("Import failed", { description: err.message });
            }
        };
        reader.readAsText(file);
    };

    if (loading && schedule.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-slate-50">
                <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Calendar</p>
            </div>
        );
    }

    const accentColor = (code?: string) => ({
        "bg-blue-500":    code === 'blue',
        "bg-indigo-500":  code === 'indigo',
        "bg-rose-500":    code === 'rose',
        "bg-emerald-500": code === 'emerald',
        "bg-amber-500":   code === 'amber',
        "bg-slate-300":   !code || code === 'slate',
    });

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-50">
                <Header title={isParentView ? "Academic Coordinates" : (isTeacherView ? "Logistics Command" : "My Schedule")} />

                {/* ── Centered page content ── */}
                <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-8 space-y-5">

                    {/* ══ Day Selector Card ══ */}
                    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-md p-4 md:p-6">

                        {/*
                          * Grid with 6 equal cols = all days always visible, no overflow.
                          * justify-center + overflow-x-auto conflict on mobile is avoided entirely.
                          */}
                        <div className="grid grid-cols-6 gap-1.5 w-full">
                            {DAYS.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        "h-9 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-wider transition-all border-2 w-full",
                                        selectedDay === day
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.05]"
                                            : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                                    )}
                                >
                                    {/* Always 3-char on mobile, full name on md+ */}
                                    <span className="md:hidden">{day.slice(0, 3)}</span>
                                    <span className="hidden md:inline">{day}</span>
                                </button>
                            ))}
                        </div>

                        {/* Teacher CSV tools */}
                        {isTeacherView && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Required CSV Schema:</span>
                                    <div className="flex flex-wrap justify-center gap-1.5">
                                        {['class', 'section', 'day', 'subject', 'faculty', 'room', 'start', 'end'].map(col => (
                                            <span key={col} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[8px] font-bold text-slate-500 lowercase">{col}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <Button
                                        variant="outline"
                                        className="h-10 flex-1 rounded-2xl border-slate-200 text-[9px] font-black uppercase tracking-widest gap-1.5 hover:bg-slate-50 active:scale-95"
                                        onClick={() => {
                                            const content = "class,section,day,subject,faculty,room,start,end\nBCA,A,Monday,Web Design,Dr. Smith,Lab-1,09:00:00,10:00:00";
                                            const a = document.createElement('a');
                                            a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
                                            a.download = 'attendly_template.csv';
                                            a.click();
                                        }}
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                        Template
                                    </Button>
                                    <label className="h-10 flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all cursor-pointer active:scale-95">
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        Upload CSV
                                        <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ══ Main Grid ══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                        {/* Schedule feed — 2/3 on desktop */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedDay}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="space-y-3"
                                >
                                    {schedule.map((slot) => (
                                        <Card key={slot.id} className="relative overflow-hidden border-none ring-1 ring-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", accentColor(slot.color_code))} />
                                            <div className="pl-5 pr-4 py-4 md:pl-6 md:pr-5 md:py-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 flex flex-col items-center min-w-[56px] bg-slate-50 border border-slate-100 rounded-xl py-2 px-1">
                                                        <Clock className="w-3 h-3 text-slate-400 mb-1" />
                                                        <span className="text-[9px] font-black text-slate-900 uppercase">{slot.start_time?.slice(0, 5)}</span>
                                                        <span className="text-[7px] font-bold text-slate-400 mt-0.5">–{slot.end_time?.slice(0, 5)}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-black text-slate-900 italic uppercase tracking-tight truncate">{slot.subject}</h3>
                                                            <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 text-[7px] font-black text-slate-500 rounded-md uppercase">{slot.classes?.section || 'A'}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3 text-blue-400" />{slot.teacher_name}</span>
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-400" />{slot.room_number}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <Button variant="outline" className="h-8 flex-1 rounded-xl border-slate-100 text-[8px] font-black uppercase tracking-widest hover:bg-slate-50">
                                                        Resources
                                                    </Button>
                                                    {isTeacherView && (
                                                        <Button variant="ghost" className="h-8 flex-1 rounded-xl text-rose-500 text-[8px] font-black uppercase tracking-widest hover:bg-rose-50">
                                                            Postpone
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {schedule.length === 0 && (
                                        <div className="py-20 flex flex-col items-center justify-center text-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                                                <Calendar className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <p className="text-slate-300 font-black uppercase text-[9px] tracking-[0.3em] italic">
                                                No sessions for <span className="text-slate-500">{selectedDay}</span>
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ══ Right Sidebar ══ */}
                        <div className="space-y-4">
                            {/* Final Exam */}
                            <Card className="border-none rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                                <div className="relative z-10 p-5 md:p-6">
                                    <h3 className="text-sm font-black italic uppercase tracking-tight">Final Exam</h3>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5 mb-4">Institutional Milestone</p>
                                    {exams.length > 0 ? (
                                        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-black text-blue-300 uppercase tracking-tight truncate">{exams[0].subject}</span>
                                                <span className="text-[7px] font-black bg-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse shrink-0">Critical</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm font-black tracking-tight uppercase italic">{new Date(exams[0].exam_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-6 text-slate-600 text-[9px] font-black uppercase tracking-widest italic">No Examinations Found</p>
                                    )}
                                </div>
                            </Card>

                            {/* Live Intelligence */}
                            <Card className="border-none rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                                <div className="p-5 md:p-6">
                                    <h3 className="text-[9px] font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                        Live Intelligence
                                    </h3>
                                    <div className="space-y-3.5">
                                        {alerts.map((alert) => (
                                            <div key={alert.id} className="flex gap-3 items-start group cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-slate-900 group-hover:bg-blue-600 transition-colors" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug uppercase tracking-tight">{alert.title}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{new Date(alert.created_at).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {alerts.length === 0 && (
                                            <p className="text-center py-6 text-slate-300 font-black uppercase text-[8px] tracking-widest italic">All Nodes Silent</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>{/* /grid */}

                    {/* Bottom spacing for mobile nav */}
                    <div className="h-4 md:h-0" />
                </div>{/* /content */}
            </div>
        </PageTransition>
    );
}
