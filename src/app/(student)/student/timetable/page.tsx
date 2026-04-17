"use client";

import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Clock, BookOpen, User, MapPin, Calendar, Bell, ChevronLeft, ChevronRight, UploadCloud, RefreshCcw, Sparkles, FileSpreadsheet } from "lucide-react";
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

      // Resolve class_id for the user
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

      // Fetch exams & notifications for context
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
                class_id: null // In real ingestion, lookup class_id from className/section
            };
        });
        
        // Trial Shortcut: Lookup real class IDs first
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

  if (loading && schedule.length === 0) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Institutional Calendar</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title={isParentView ? "Academic Coordinates" : (isTeacherView ? "Logistics Command" : "My Schedule")} />
        
        <div className="flex-1 py-10 space-y-10 px-6 md:px-0">
             {/* Weekly Terminal */}
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2",
                                selectedDay === day 
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                                : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                  </div>

                  {isTeacherView && (
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="hidden md:flex flex-wrap gap-2 mr-4">
                            {['class', 'section', 'day', 'subject', 'faculty', 'room', 'start', 'end'].map(col => (
                                <span key={col} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">{col}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                className="h-14 px-8 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 gap-2"
                                onClick={() => {
                                    const content = "class,section,day,subject,faculty,room,start,end\nBCA,A,Monday,Web Design,Dr. Smith,Lab-1,09:00:00,10:00:00";
                                    const blob = new Blob([content], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'attendly_schedule_template.csv';
                                    a.click();
                                }}
                            >
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Template
                            </Button>
                            <label className="h-14 px-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all cursor-pointer group active:scale-95">
                                <UploadCloud className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                                Ingest Master CSV
                                <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
                            </label>
                        </div>
                    </div>
                  )}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Session Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDay}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {schedule.map((slot: any, i: number) => (
                                <Card key={slot.id} className="p-10 border-none ring-1 ring-slate-100 rounded-[3rem] bg-white group hover:shadow-3xl transition-all relative overflow-hidden">
                                    <div className={cn("absolute left-0 top-0 bottom-0 w-2.5 shadow-xl", {
                                        "bg-blue-600": slot.color_code === 'blue',
                                        "bg-indigo-600": slot.color_code === 'indigo',
                                        "bg-rose-600": slot.color_code === 'rose',
                                        "bg-emerald-600": slot.color_code === 'emerald',
                                        "bg-amber-600": slot.color_code === 'amber',
                                        "bg-slate-600": slot.color_code === 'slate',
                                    })} />

                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-10">
                                            <div className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 border border-slate-100 min-w-[130px] shadow-inner">
                                                <Clock className="w-5 h-5 text-slate-400 mb-2" />
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{slot.start_time.slice(0, 5)}</span>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase mt-1">To {slot.end_time.slice(0, 5)}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight italic uppercase">{slot.subject}</h3>
                                                    <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg uppercase tracking-widest">{slot.classes?.section || 'A'}</span>
                                                </div>
                                                <div className="flex items-center gap-6 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                                                    <span className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-blue-500" />
                                                        {slot.teacher_name}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-rose-500" />
                                                        {slot.room_number}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                             <Button variant="outline" className="h-12 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50">
                                                Resources
                                             </Button>
                                             {isTeacherView && (
                                                <Button variant="ghost" className="h-12 rounded-2xl text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50">
                                                    Postpone
                                                </Button>
                                             )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {schedule.length === 0 && (
                                <div className="py-32 text-center text-slate-400 italic font-black text-sm uppercase tracking-[0.3em] opacity-30">
                                    Zero Academic Sessions Resolved for {selectedDay}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Logistics Context */}
                <div className="space-y-8">
                    <Card className="p-8 border-none rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600 opacity-5 group-hover:opacity-10 transition-opacity" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2 italic uppercase">Final Exam</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-8">Institutional Milestone</p>
                            
                            {exams.length > 0 ? (
                                <div className="p-6 rounded-[2rem] bg-white/10 border border-white/10 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-blue-400 uppercase tracking-tight">{exams[0].subject}</span>
                                        <span className="text-[9px] font-black bg-rose-600 px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse shadow-xl shadow-rose-600/20">Critical</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                                            <Calendar className="w-6 h-6 outline-none" />
                                        </div>
                                        <span className="text-lg font-black tracking-tighter uppercase italic">{new Date(exams[0].exam_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-30 italic text-xs font-black uppercase tracking-widest">No Examinations Found</div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 border-none rounded-[3rem] bg-white shadow-xl ring-1 ring-slate-100 flex flex-col h-fit">
                        <h3 className="text-xs font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Live Intelligence
                        </h3>
                        <div className="space-y-6">
                            {alerts.map((alert, i) => (
                                <div key={alert.id} className="flex gap-4 items-start group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-slate-900 group-hover:scale-125 transition-transform" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tight">{alert.title}</p>
                                        <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter opacity-70">Automated Push • {new Date(alert.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                            {alerts.length === 0 && (
                                <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px] tracking-widest italic">All Nodes Silent</p>
                            )}
                        </div>
                    </Card>
                </div>
             </div>
        </div>
      </div>
    </PageTransition>
  );
}
