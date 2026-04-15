"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, GraduationCap, Users, Pencil, Trash2, Calendar, Clock, ChevronRight, Briefcase, UploadCloud, FileSpreadsheet, FileBarChart2, Zap, Trophy, Target, CreditCard, RefreshCcw, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { academicService } from "@/services/academic";
import { supabase } from "@/lib/supabase";

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'registry'>('my');
  const [registry, setRegistry] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await academicService.getClasses();
      setRegistry(data || []);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          setMyClasses(data?.filter((c: any) => c.teacher_id === user.id) || []);
      }
    } catch (error) {
      toast.error("Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'grid' | 'students'>('grid');
  const [selectedClass, setSelectedClass] = useState<any>(null);

  useEffect(() => {
    if (selectedClass && view === 'students') {
      academicService.getStudentsByClass(selectedClass.id)
        .then(setStudents)
        .catch(() => toast.error("Failed to sync student registry"));
    }
  }, [selectedClass, view]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  
  const [newRegName, setNewRegName] = useState("");
  const [newRegSection, setNewRegSection] = useState("");
  const [newRegYear, setNewRegYear] = useState("1");
  const [newRegDept, setNewRegDept] = useState("General");

  const [claimSubject, setClaimSubject] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRegistry = registry.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.owner_name || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredMyClasses = myClasses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleClassClick = (cls: any) => {
      setSelectedClass(cls);
      setView('students');
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
    if (!claimSubject) return toast.error("Subject ID required");
    try {
        setIsSyncing(true);
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('classes').update({ teacher_id: user?.id, owner_name: claimSubject }).eq('id', selectedClass.id);
        toast.success(`Successfully claimed ${selectedClass.name} portfolio`);
        setIsClaimOpen(false);
        loadData();
    } catch (e) {
        toast.error("Claim failed");
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
        const payload = lines.slice(1).map((line) => {
            const [name, roll, email] = line.split(',').map(v => v.trim());
            return {
                name: name || "Unknown",
                roll_number: roll || "N/A",
                email: email || "",
                class_id: selectedClass.id,
                department: selectedClass.department || 'General'
            };
        });
        await academicService.importStudents(payload);
        const refreshed = await academicService.getStudentsByClass(selectedClass.id);
        setStudents(refreshed);
        toast.dismiss();
        toast.success(`${payload.length} units synchronized to cloud`);
      } catch (err: any) {
        toast.dismiss();
        toast.error("Ingestion failed");
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
        <Header title={view === 'students' ? `Registry / ${selectedClass?.name}` : "Institutional Directories"} />
        
        <div className="flex-1 py-10 space-y-8 px-6 md:px-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {view === 'grid' ? (
              <>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Academic Sections</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Initialize or claim trial session endpoints</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Identify registry..." 
                            className="pl-11 w-[320px] border-slate-200 shadow-sm rounded-2xl h-12 bg-white focus:ring-4 focus:ring-blue-500/5 font-bold transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="h-12 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/10 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> New Directory
                    </Button>
                </div>
              </>
            ) : (
                <div className="flex items-center justify-between w-full">
                    <Button variant="ghost" onClick={() => setView('grid')} className="h-12 px-6 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100">
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Sections
                    </Button>

                    <div className="flex items-center gap-3">
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                        
                        <Dialog>
                            <DialogTrigger render={
                                <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95">
                                    <Zap className="w-4 h-4 text-emerald-400" /> Intelligence
                                </Button>
                            } />
                            <DialogContent className="rounded-[3rem] p-10 bg-white shadow-2xl max-w-lg border-none ring-1 ring-slate-100">
                                <DialogHeader className="mb-10">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center mb-6 shadow-2xl">
                                        <Zap className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control Panel</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Execute high-priority trial milestones</DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Final Examination</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 text-center md:text-left">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target Date</Label>
                                                <Input type="date" className="h-12 rounded-2xl border-slate-200 font-bold bg-slate-50 focus:bg-white" />
                                            </div>
                                            <div className="space-y-2 text-center md:text-left">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject Lead</Label>
                                                <Input placeholder="Distributed Systems" className="h-12 rounded-2xl border-slate-200 font-bold bg-slate-50 focus:bg-white" />
                                            </div>
                                        </div>
                                        <Button className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700">Sync Exam Data</Button>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-5 h-5 text-emerald-600" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Direct Broadcaster</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 flex flex-col p-0 gap-1 transition-all">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Fee Alert</span>
                                            </Button>
                                            <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 flex flex-col p-0 gap-1 transition-all">
                                                <Trophy className="w-5 h-5 text-emerald-600" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Hall Ticket</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12 px-8 rounded-2xl text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-sm">
                            <UploadCloud className="w-5 h-5" /> Import Roster
                        </Button>
                    </div>
                </div>
            )}
          </div>

          <div className="flex p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-100 shadow-inner">
              <button onClick={() => setActiveTab('my')} className={cn("px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all", activeTab === 'my' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-500")}>My Portfolio</button>
              <button onClick={() => setActiveTab('registry')} className={cn("px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all", activeTab === 'registry' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-500")}>Global Directory</button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'grid' ? (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {activeTab === 'my' ? (
                        <>
                            {filteredMyClasses.map((cls) => (
                                <Card key={cls.id} className="p-8 border-slate-100 shadow-sm rounded-[2.5rem] bg-white group hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden" onClick={() => handleClassClick(cls)}>
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                         <GraduationCap className="w-32 h-32 text-slate-900" />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-8 group-hover:rotate-6 transition-transform shadow-inner">
                                        <GraduationCap className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 pr-10">{cls.name}</h3>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-8">{cls.department || 'GENERAL'}</p>
                                    
                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <Users className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{cls.studentsCount || 0} Units</span>
                                        </div>
                                        <div className="font-black text-slate-300 text-[10px] uppercase tracking-[0.2em]">SEC {cls.section}</div>
                                    </div>
                                </Card>
                            ))}
                            <button onClick={() => setIsAddOpen(true)} className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] group hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all shadow-inner">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-[10px]">Initialize Section</p>
                            </button>
                        </>
                    ) : (
                        filteredRegistry.map((cls) => (
                            <Card key={cls.id} className="p-8 border-slate-100 shadow-sm rounded-[2.5rem] bg-white hover:bg-slate-50 group transition-all">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                                        <Briefcase className="w-7 h-7" />
                                    </div>
                                    <Button onClick={() => { setSelectedClass(cls); setIsClaimOpen(true); }} className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                        Claim Endpoint
                                    </Button>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{cls.name}</h3>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-10">Section {cls.section} • Year {cls.year}</p>
                                
                                <div className="mt-auto flex items-center gap-4 p-4 bg-white/80 rounded-2xl border border-slate-100 group-hover:shadow-sm transition-all">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-xl ring-4 ring-slate-50">
                                        {(cls.owner_name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Superintendent</p>
                                        <p className="text-xs font-black text-slate-900 truncate">{cls.owner_name || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                    <div className="flex items-center gap-8 p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl backdrop-blur-md">
                            <GraduationCap className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-3xl font-black tracking-tighter uppercase italic">{selectedClass?.name} <span className="text-blue-500">Sec {selectedClass?.section}</span></h2>
                                <span className="px-4 py-1 bg-white text-slate-900 text-[10px] font-black uppercase rounded-full shadow-lg">
                                    Year {selectedClass?.year}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Master Roster Registry • Trial ID: {selectedClass?.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <StatusStat label="Active Units" value={students.length} icon={Users} color="blue" />
                        <StatusStat label="Target Node" value={selectedClass?.section} icon={Target} color="indigo" />
                        <StatusStat label="Current Cycle" value={`Year ${selectedClass?.year}`} icon={Zap} color="amber" />
                        <StatusStat label="Health Status" value="Online" icon={Trophy} color="emerald" />
                    </div>

                    <Card className="border-none rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border border-slate-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Unit ID</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Details</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Email</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Activity Status</th>
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
                                                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xl shadow-emerald-500/50" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Registered</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-black text-sm uppercase tracking-widest italic opacity-30">Registry Empty: Import Roster to Continue</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="rounded-[3rem] p-10 bg-white shadow-3xl max-w-md ring-1 ring-slate-100 border-none">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">New Directory</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Initialize a master endpoint for the college trial.</DialogDescription>
                </DialogHeader>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Academic Title</Label>
                        <Input value={newRegName} onChange={(e) => setNewRegName(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="h-14 rounded-2xl border-slate-200 font-black focus:ring-4 focus:ring-blue-600/5 transition-all text-sm leading-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Section Node</Label>
                            <Input value={newRegSection} onChange={(e) => setNewRegSection(e.target.value)} placeholder="A, B, or C" className="h-14 rounded-2xl border-slate-200 font-black text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Academic Year</Label>
                            <Select value={newRegYear} onValueChange={(v) => v && setNewRegYear(v)}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 font-black text-sm">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl p-2">
                                    <SelectItem value="1" className="font-bold">Year 1 (FY)</SelectItem>
                                    <SelectItem value="2" className="font-bold">Year 2 (SY)</SelectItem>
                                    <SelectItem value="3" className="font-bold">Year 3 (TY)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Institutional Dept</Label>
                        <Input value={newRegDept} onChange={(e) => setNewRegDept(e.target.value)} placeholder="e.g. Science / Arts" className="h-14 rounded-2xl border-slate-200 font-black text-sm" />
                    </div>
                </div>
                <DialogFooter className="mt-10">
                    <Button onClick={handleCreateRegistry} disabled={isSyncing} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isSyncing ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                        Initialize Section
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Claim Dialog */}
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
            <DialogContent className="rounded-[3rem] p-10 bg-white shadow-3xl max-w-md ring-1 ring-slate-100 border-none">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Secure Portfolio</DialogTitle>
                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Connect your credentials to {selectedClass?.name}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-8 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Subject Identity</Label>
                        <Input value={claimSubject} onChange={(e) => setClaimSubject(e.target.value)} placeholder="e.g. Quantum Physics" className="h-14 rounded-2xl border-slate-200 font-black focus:ring-4 focus:ring-blue-600/5" />
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button onClick={handleClaim} disabled={isSyncing} className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                        {isSyncing ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                        Synchronize Portfolio
                    </Button>
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
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };
    return (
        <Card className="p-8 rounded-[2.5rem] border-none bg-white shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all ring-1 ring-slate-100">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner", colors[color])}>
                <Icon className="w-7 h-7" />
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">{value}</p>
            </div>
        </Card>
    );
}
