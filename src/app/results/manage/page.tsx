"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { BookOpen, GraduationCap, Save, RefreshCcw, Search, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { registryService } from "@/services/registry.service";
import { toast } from "sonner";
import { calculateFinalMarks, calculateAttendanceMarks, calculateCIAMarks, calculateTestMarks } from "@/services/marks.service";

export default function MarksManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch classes claimed by this teacher
      const { data: claims } = await supabase
        .from('class_claims')
        .select('*, classes(*)')
        .eq('teacher_id', user.id);
      
      const teacherClasses = (claims || []).map(c => c.classes).filter(Boolean);
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) setSelectedClass(teacherClasses[0].id);
    } catch (err) {
      toast.error("Failed to load faculty assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const data = await registryService.getStudentsByClass(selectedClass);
      
      // Fetch existing marks for these students
      const { data: existingMarks } = await supabase
        .from('marks')
        .select('*')
        .in('student_id', data.map(s => s.id));

      const marksMap = (existingMarks || []).reduce((acc, m) => ({ ...acc, [m.student_id]: m }), {});

      const studentsWithMarks = data.map(s => {
        const m = marksMap[s.id] || {};
        return {
          ...s,
          cia1: m.cia1 || 0,
          cia2: m.cia2 || 0,
          test1: m.test1 || 0,
          test2: m.test2 || 0,
          attendancePercentage: s.attendance || 100
        };
      });

      setStudents(studentsWithMarks);
    } catch (err) {
      toast.error("Failed to load student registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const updateMark = (studentId: string, field: string, value: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, [field]: value } : s
    ));
  };

  const saveMarks = async () => {
    try {
      setSaving(true);
      const promises = students.map(s => {
        const attendanceMarks = calculateAttendanceMarks(s.attendancePercentage);
        const ciaTotal = calculateCIAMarks(s.cia1, s.cia2);
        const testScore = calculateTestMarks(s.test1, s.test2);
        const finalMarks = calculateFinalMarks(attendanceMarks, ciaTotal, testScore);

        return registryService.updateStudentMarks(s.id, {
          cia1: s.cia1,
          cia2: s.cia2,
          test1: s.test1,
          test2: s.test2,
          attendance_marks: attendanceMarks,
          cia_total: ciaTotal,
          test_marks: testScore,
          final_marks: finalMarks,
          attendance_percentage: s.attendancePercentage
        });
      });

      await Promise.all(promises);
      toast.success("Institutional records updated", {
        description: "All CIA and test marks have been synchronized with the main registry."
      });
    } catch (err) {
      toast.error("Failed to synchronize marks");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && classes.length === 0) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Loading Academic Terminal</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Enter Student Marks" showBack />
        
        <div className="flex-1 py-10 space-y-10 px-6 md:px-0">
          
          {/* Top Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 opacity-5 group-hover:opacity-10 transition-opacity" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
               <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[240px]">
                  <GraduationCap className="w-6 h-6 text-blue-400" />
                  <select 
                    className="bg-transparent border-none text-white font-black uppercase tracking-widest text-xs focus:ring-0 cursor-pointer w-full"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name} {c.section}</option>)}
                  </select>
               </div>

               <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input 
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-none bg-white/10 text-white placeholder:text-slate-500 font-bold focus:ring-4 focus:ring-blue-500/20 transition-all"
                  />
               </div>
            </div>

            <Button 
              disabled={students.length === 0 || saving}
              onClick={saveMarks}
              className="relative z-10 h-14 px-10 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 shadow-xl transition-all gap-3 w-full lg:w-auto"
            >
              {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </div>

          {/* Marks Entry Grid */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                         <th className="py-6 px-8">Student Name</th>
                         <th className="py-6 px-4">Attendance %</th>
                         <th className="py-6 px-4">CIA 1 (10)</th>
                         <th className="py-6 px-4">CIA 2 (10)</th>
                         <th className="py-6 px-4">Test 1 (25)</th>
                         <th className="py-6 px-4">Test 2 (25)</th>
                         <th className="py-6 px-4 text-right">Final Marks</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      <AnimatePresence mode="popLayout">
                         {filteredStudents.map((s, i) => {
                            const attPts = calculateAttendanceMarks(s.attendancePercentage);
                            const ciaTotal = calculateCIAMarks(s.cia1, s.cia2);
                            const testPts = calculateTestMarks(s.test1, s.test2);
                            const final = calculateFinalMarks(attPts, ciaTotal, testPts);
                            
                            return (
                               <motion.tr 
                                 key={s.id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.02 }}
                                 className="hover:bg-slate-50/50 transition-colors group"
                               >
                                  <td className="py-5 px-8">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                                          {s.roll_number.split('-').pop()}
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-slate-900 leading-tight">{s.name}</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.roll_number}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="py-5 px-4">
                                     <div className={cn(
                                       "px-3 py-1 rounded-full text-[10px] font-black w-fit",
                                       s.attendancePercentage >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                     )}>
                                       {s.attendancePercentage}%
                                     </div>
                                  </td>
                                  <td className="py-5 px-4">
                                     <input 
                                       type="number"
                                       max={10}
                                       min={0}
                                       value={s.cia1}
                                       onChange={(e) => updateMark(s.id, 'cia1', Number(e.target.value))}
                                       className="w-16 h-10 bg-slate-100 border-none rounded-xl text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                     />
                                  </td>
                                  <td className="py-5 px-4">
                                     <input 
                                       type="number"
                                       max={10}
                                       min={0}
                                       value={s.cia2}
                                       onChange={(e) => updateMark(s.id, 'cia2', Number(e.target.value))}
                                       className="w-16 h-10 bg-slate-100 border-none rounded-xl text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                     />
                                  </td>
                                  <td className="py-5 px-4">
                                     <input 
                                       type="number"
                                       max={25}
                                       min={0}
                                       value={s.test1}
                                       onChange={(e) => updateMark(s.id, 'test1', Number(e.target.value))}
                                       className="w-16 h-10 bg-slate-100 border-none rounded-xl text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                     />
                                  </td>
                                  <td className="py-5 px-4">
                                     <input 
                                       type="number"
                                       max={25}
                                       min={0}
                                       value={s.test2}
                                       onChange={(e) => updateMark(s.id, 'test2', Number(e.target.value))}
                                       className="w-16 h-10 bg-slate-100 border-none rounded-xl text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                     />
                                  </td>
                                  <td className="py-5 px-8 text-right">
                                     <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-slate-900 leading-none">{final}</span>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Out of 20</span>
                                     </div>
                                  </td>
                               </motion.tr>
                            );
                         })}
                      </AnimatePresence>
                   </tbody>
                </table>
                {filteredStudents.length === 0 && (
                   <div className="py-32 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-12 h-12 text-slate-100 mb-4" />
                      <h4 className="font-black text-slate-900 uppercase tracking-widest mb-1">No Students Found</h4>
                      <p className="text-xs font-bold text-slate-400">Try adjusting your search or selecting a different class.</p>
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
