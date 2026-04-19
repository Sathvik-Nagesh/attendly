"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, GraduationCap, Users, Trash2, Calendar, ChevronRight, Briefcase, UploadCloud, Zap, Trophy, Target, CreditCard, RefreshCcw, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { academicService } from "@/services/academic";
import { registryService } from "@/services/registry.service";
import { supabase } from "@/lib/supabase";

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'registry'>('my');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'grid' | 'details'>('grid');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  
  const [newRegName, setNewRegName] = useState("");
  const [newRegSection, setNewRegSection] = useState("");
  const [newRegYear, setNewRegYear] = useState("1");
  const [newRegSem, setNewRegSem] = useState("1");
  const [newRegDept, setNewRegDept] = useState("Commerce");

  const [claimSubject, setClaimSubject] = useState("");
  const [claimSemester, setClaimSemester] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setClaimSubject("");
  }, [claimSemester, selectedClass]);

  useEffect(() => {
    loadData();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass && view === 'details') {
      academicService.getStudentsByClass(selectedClass.id)
        .then(setStudents)
        .catch(() => toast.error("Failed to sync student registry"));
    }
  }, [selectedClass, view]);

  const loadSubjects = async () => {
    try {
        const { data } = await supabase.from('subjects').select('*');
        setSubjects(data || []);
    } catch (e) {
        console.error(e);
    }
  };

  const loadData = async () => {
    try {
        setLoading(true);
        const data = await registryService.getClasses();
        setClasses(data || []);
    } catch (err) {
        toast.error("Failed to load registries");
    } finally {
        setLoading(false);
    }
  };

  const currentUser = supabase.auth.getUser(); // This is async, better to use state or a hook

  const { filteredMyClasses, filteredRegistry } = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    // For "My Portfolio", we look at class_claims
    const my = classes.filter(cls => 
      cls.class_claims?.some((claim: any) => claim.teacher_id === "USER_ID_PLACEHOLDER") // We'll fix this below
    );
    
    // Actually, let's get current user ID properly
    return {
        filteredMyClasses: classes.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchLower);
            const isOwned = c.class_claims?.some((claim: any) => claim.teacher_id === selectedClass?.teacher_id); 
            // Better: Filter by teacher_id once we have it
            return matchesSearch;
        }),
        filteredRegistry: classes.filter(c => c.name.toLowerCase().includes(searchLower))
    };
  }, [classes, search]);

  // Real filtering logic
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
      supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const myPortfolio = useMemo(() => {
    if (!currentUserId) return [];
    const portfolio: any[] = [];
    classes.forEach(cls => {
        cls.class_claims?.forEach((claim: any) => {
            if (claim.teacher_id === currentUserId) {
                portfolio.push({
                    ...cls,
                    claim_id: claim.id,
                    subject_name: claim.subjects?.name,
                    subject_code: claim.subjects?.code,
                    display_name: `${cls.name} (${claim.subjects?.name})`
                });
            }
        });
    });
    return portfolio.filter(p => p.display_name.toLowerCase().includes(search.toLowerCase()));
  }, [classes, currentUserId, search]);

  const globalRegistry = useMemo(() => {
    return classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [classes, search]);

  const handleClassClick = (cls: any) => {
      setSelectedClass(cls);
      setView('details');
  };

  const handleCreateRegistry = async () => {
      if (!newRegName || !newRegSection) return toast.error("Essential fields missing");
      try {
          setIsSyncing(true);
          const { data: { user } } = await supabase.auth.getUser();
          await academicService.createClass({
              name: newRegName,
              section: newRegSection,
              year: parseInt(newRegYear),
              semester: parseInt(newRegSem),
              department: newRegDept,
              teacher_id: user?.id
          });
          toast.success("Institutional Registry Initialized");
          setIsAddOpen(false);
          loadData();
      } catch (e) {
          toast.error("Creation failed");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleClaim = async () => {
    if (!claimSubject) return toast.error("Subject Selection Required");
    try {
        setIsSyncing(true);
        
        // Double conflict check handled by DB unique constraint + service
        await registryService.claimClass(selectedClass.id, claimSubject);

        toast.success(`Subject portfolio synchronized successfully`);
        setIsClaimOpen(false);
        setClaimSubject("");
        loadData();
    } catch (e: any) {
        toast.error(e.message || "Claim failed");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    try {
        await academicService.deleteStudent(studentId);
        setStudents(prev => prev.filter(s => s.id !== studentId));
        toast.success("Student removed successfully");
    } catch (err) {
        toast.error("Failed to delete student");
    }
  };

  const handleDeleteAllStudents = async () => {
    if (!selectedClass) return;
    if (!confirm(`CRITICAL: Delete ALL students from ${selectedClass.name}?`)) return;
    
    try {
        setIsSyncing(true);
        await academicService.deleteStudentsByClass(selectedClass.id);
        setStudents([]);
        toast.success("Class registry cleared");
        loadData();
    } catch (err) {
        toast.error("Mass deletion failed");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;
    
    toast.loading("Executing cloud ingestion...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== "");
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const nameIdx = headers.indexOf('name');
        const rollIdx = headers.indexOf('roll');
        const emailIdx = headers.indexOf('email');

        if (nameIdx === -1 || rollIdx === -1 || emailIdx === -1) {
            throw new Error("CSV must have name, roll, email headers");
        }

        const payload = lines.slice(1).map((line) => {
            const values = line.split(',').map(v => v.trim());
            const student: any = {
                name: values[nameIdx] || "Unknown",
                roll_number: values[rollIdx] || "N/A",
                email: values[emailIdx] || "",
                class_id: selectedClass.id,
                department: selectedClass.department || 'General'
            };
            
            headers.forEach((h, idx) => {
                if (h.startsWith('tc_') || h.startsWith('tp_')) {
                    student[h] = parseInt(values[idx]) || 0;
                }
            });
            return student;
        });

        const result = await academicService.importStudents(payload.map((s: any) => ({
            name: s.name,
            roll_number: s.roll_number,
            email: s.email,
            class_id: s.class_id,
            department: s.department
        })));
        
        const subjectRecords: any[] = [];
        result?.forEach((s: any) => {
            const original = payload.find(p => p.roll_number === s.roll_number);
            Object.keys(original).forEach(key => {
                if (key.startsWith('tc_')) {
                    const code = key.replace('tc_', '').toUpperCase();
                    subjectRecords.push({
                        student_id: s.id,
                        subject_code: code,
                        tc: original[key],
                        tp: original[`tp_${code.toLowerCase()}`] || 0
                    });
                }
            });
        });

        if (subjectRecords.length > 0) {
            await academicService.importInitialAttendance(subjectRecords);
        }

        const refreshed = await academicService.getStudentsByClass(selectedClass.id);
        setStudents(refreshed);
        toast.dismiss();
        toast.success(`${payload.length} students synchronized to cloud`);
        loadData();
      } catch (err: any) {
        toast.dismiss();
        toast.error("Ingestion failed", { description: err.message });
      }
    };
    reader.readAsText(file);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Resolving Global Directories</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Academic Jurisdictions" />
        
        <div className="flex-1 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {view === 'grid' ? (
              <>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Academic Sections</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Initialize or claim trial session endpoints</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Identify registry..." 
                            className="pl-11 w-full sm:w-[320px] border-slate-200 shadow-sm rounded-2xl h-12 bg-white focus:ring-4 focus:ring-blue-500/5 font-bold transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="h-12 px-6 sm:px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/10 transition-all text-[10px] sm:text-xs">
                        <Plus className="w-4 h-4 mr-2" /> New Directory
                    </Button>
                </div>
              </>
            ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                    <Button variant="ghost" onClick={() => setView('grid')} className="h-10 md:h-12 px-4 md:px-6 rounded-2xl text-slate-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 w-fit">
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Sections
                    </Button>

                    <div className="flex items-center gap-2 md:gap-3">
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-10 md:h-12 px-4 md:px-8 rounded-2xl text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-50 font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-sm flex-1 md:flex-none">
                            <UploadCloud className="w-4 h-4 md:w-5 md:h-5" /> Import Roster
                        </Button>
                    </div>
                </div>
            )}
          </div>

          <div className="flex p-1 bg-slate-100/50 rounded-2xl w-full sm:w-fit border border-slate-100 shadow-inner">
              <button onClick={() => setActiveTab('my')} className={cn("flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[9px] sm:text-[10px] uppercase font-black tracking-widest transition-all", activeTab === 'my' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-500")}>My Portfolio</button>
              <button onClick={() => setActiveTab('registry')} className={cn("flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[9px] sm:text-[10px] uppercase font-black tracking-widest transition-all", activeTab === 'registry' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-500")}>Global Directory</button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'grid' ? (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                    {activeTab === 'my' ? (
                        <>
                            {myPortfolio.map((cls) => (
                                <Card key={cls.claim_id} className="p-6 md:p-8 border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] bg-white group hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden" onClick={() => handleClassClick(cls)}>
                                    <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                         <GraduationCap className="w-24 h-24 md:w-32 md:h-32 text-slate-900" />
                                    </div>
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 md:mb-8 group-hover:rotate-6 transition-transform shadow-inner">
                                        <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight mb-2 pr-10 truncate">{cls.name}</h3>
                                    <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{cls.subject_name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-6 md:mb-8">{cls.department || 'GENERAL'}</p>
                                    
                                    <div className="pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-tighter">{cls.students_count || 0} Students</span>
                                        </div>
                                        <div className="font-black text-slate-300 text-[9px] md:text-[10px] uppercase tracking-[0.2em]">SEC {cls.section}</div>
                                    </div>
                                </Card>
                            ))}
                            <button onClick={() => setActiveTab('registry')} className="p-6 md:p-10 border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[2.5rem] group hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-inner">
                                    <Zap className="w-7 h-7 md:w-8 md:h-8" />
                                </div>
                                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Claim New Subject</p>
                            </button>
                        </>
                    ) : (
                        globalRegistry.map((cls) => (
                            <Card key={cls.id} className="p-6 md:p-8 border-slate-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] bg-white hover:bg-slate-50 group transition-all">
                                <div className="flex justify-between items-start mb-6 md:mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                                        <Briefcase className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <Button onClick={() => { setSelectedClass(cls); setIsClaimOpen(true); }} className="h-9 md:h-10 px-4 md:px-6 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                        Claim Endpoint
                                    </Button>
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight mb-2 truncate">{cls.name}</h3>
                                <p className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-8 md:mb-10">Section {cls.section} • Year {cls.year}</p>
                                
                                <div className="mt-auto flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white/80 rounded-2xl border border-slate-100 group-hover:shadow-sm transition-all">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] md:text-xs font-black shadow-xl ring-4 ring-slate-50">
                                        {(cls.owner_name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter">Current Lead</p>
                                        <p className="text-[10px] md:text-xs font-black text-slate-900 truncate max-w-[120px]">{cls.class_claims?.length || 0} Subjects Managed</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md shrink-0">
                            <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
                                <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase">{selectedClass?.name} <span className="text-blue-500">Sec {selectedClass?.section}</span></h2>
                                <span className="px-3 md:px-4 py-0.5 md:py-1 bg-white text-slate-900 text-[8px] md:text-[10px] font-black uppercase rounded-full shadow-lg">
                                    Year {selectedClass?.year}
                                </span>
                            </div>
                            <p className="text-[9px] md:text-xs text-slate-400 font-black uppercase tracking-widest">Master Roster Registry • Trial ID: {selectedClass?.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        <StatusStat label="Students" value={students.length} icon={Users} color="blue" />
                        <StatusStat label="Node" value={selectedClass?.section} icon={Target} color="indigo" />
                        <StatusStat label="Cycle" value={`Y${selectedClass?.year}`} icon={Zap} color="amber" />
                        <StatusStat label="Actions" value={
                            <Button variant="ghost" size="sm" onClick={handleDeleteAllStudents} className="h-8 rounded-lg text-xs font-black text-red-500 hover:bg-red-50 px-0">
                                Purge All
                            </Button>
                        } icon={Trash2} color="rose" />
                    </div>

                    <Card className="border-none rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border border-slate-100">
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student ID</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Details</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Email</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-600">
                                            <td className="px-10 py-6 text-sm font-black text-slate-900 uppercase tracking-tighter">{student.roll_number}</td>
                                            <td className="px-10 py-6">
                                                <div className="text-sm font-black text-slate-900 tracking-tight">{student.name}</div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{student.department}</p>
                                            </td>
                                            <td className="px-10 py-6 text-xs font-bold text-slate-500/60 lowercase">{student.email}</td>
                                            <td className="px-10 py-6 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)} className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-black text-sm uppercase tracking-widest opacity-30">Registry Empty: Import Roster to Continue</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="lg:hidden divide-y divide-slate-100">
                            {students.map((student) => (
                                <div key={student.id} className="p-6 space-y-4 active:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-black text-slate-900 leading-tight text-base truncate uppercase">{student.name}</div>
                                            <div className="text-[9px] text-slate-400 font-bold mt-0.5 truncate lowercase">{student.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">ID: {student.roll_number}</div>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)} className="h-8 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest ml-auto">Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="w-[95vw] max-w-md rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 bg-white shadow-3xl ring-1 ring-slate-100 border-none">
                <DialogHeader className="mb-6 md:mb-8">
                    <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">New Directory</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[9px]">Initialize a master endpoint for the college trial.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Academic Title</Label>
                        <Input value={newRegName} onChange={(e) => setNewRegName(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="h-12 md:h-14 rounded-xl md:rounded-2xl border-slate-200 font-black focus:ring-4 focus:ring-blue-600/5 transition-all text-sm leading-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Section Node</Label>
                            <Input value={newRegSection} onChange={(e) => setNewRegSection(e.target.value)} placeholder="A, B, or C" className="h-14 rounded-2xl border-slate-200 font-black text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Academic Year</Label>
                            <Select value={newRegYear} onValueChange={(v) => v && setNewRegYear(v as string)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black text-sm">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl p-2">
                                    <SelectItem value="1" className="font-bold">Year 1 (FY)</SelectItem>
                                    <SelectItem value="2" className="font-bold">Year 2 (SY)</SelectItem>
                                    <SelectItem value="3" className="font-bold">Year 3 (TY)</SelectItem>
                                    <SelectItem value="4" className="font-bold">Year 4 (Final)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Institutional Dept</Label>
                            <Select value={newRegDept} onValueChange={(v) => v && setNewRegDept(v as string)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="BCOM">BCOM</SelectItem>
                                    <SelectItem value="BBA">BBA</SelectItem>
                                    <SelectItem value="BCA">BCA</SelectItem>
                                    <SelectItem value="Commerce">Commerce</SelectItem>
                                    <SelectItem value="Science">Science</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Current Semester</Label>
                            <Select value={newRegSem} onValueChange={(v) => v && setNewRegSem(v as string)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {[1,2,3,4,5,6,7,8].map(s => (
                                        <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-8 md:mt-10">
                    <Button onClick={handleCreateRegistry} disabled={isSyncing} className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isSyncing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Initialize Section
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Claim Dialog */}
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
            <DialogContent className="rounded-[3rem] p-10 bg-white shadow-3xl max-w-xl ring-1 ring-slate-100 border-none">
                <DialogHeader className="mb-10 text-center">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Secure Portfolio</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">Connect your credentials to {selectedClass?.name} Sec {selectedClass?.section}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Active Semester</Label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5,6,7,8].filter(s => {
                                    const year = Math.ceil(s / 2);
                                    return year === parseInt(selectedClass?.year || "1");
                                }).map(s => (
                                    <button 
                                        key={s}
                                        type="button"
                                        onClick={() => setClaimSemester(String(s))}
                                        className={cn(
                                            "w-10 h-10 rounded-xl text-[10px] font-black transition-all",
                                            claimSemester === String(s) ? "bg-blue-600 text-white shadow-xl scale-110" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Course Identity</Label>
                            <Select value={claimSubject} onValueChange={(v) => v && setClaimSubject(v)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black">
                                    <SelectValue placeholder="Select Subject Blueprint" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl min-w-[300px] md:min-w-[450px]">
                                    {subjects
                                        .filter(s => s.semester === parseInt(claimSemester) && s.department === selectedClass?.department)
                                        .map(s => (
                                            <SelectItem key={s.id} value={s.id} className="font-bold">
                                                {s.name} ({s.code})
                                            </SelectItem>
                                        ))}
                                    {subjects.filter(s => s.semester === parseInt(claimSemester) && s.department === selectedClass?.department).length === 0 && (
                                        <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">No subjects found for this semester/dept</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                        <Button 
                            onClick={handleClaim} 
                            disabled={isSyncing || !claimSubject} 
                            className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSyncing ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                            Synchronize Portfolio
                        </Button>
                        <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">Authorized faculty credentials only</p>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

function StatusStat({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };
    return (
        <Card className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-none bg-white shadow-sm flex items-center gap-3 md:gap-5 group hover:shadow-xl transition-all ring-1 ring-slate-100">
            <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border shadow-inner", colors[color])}>
                <Icon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
                <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
                <div className="text-sm md:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">{value}</div>
            </div>
        </Card>
    );
}
