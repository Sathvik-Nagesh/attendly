"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, GraduationCap, Users, Pencil, Trash2, Calendar, Clock, ChevronRight, Briefcase, UploadCloud, FileSpreadsheet, FileBarChart2, Zap, Trophy, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { academicService } from "@/services/academic";

// Mock Profile for Autofill
const USER_PROFILE = {
    name: "Prof. Srushti",
    role: "Teacher / Admin"
};

const INITIAL_REGISTRY = [
  { id: "1", name: "B.Tech CS", section: "A", year: "2", studentsCount: 45, owner: "Prof. Sneha" },
  { id: "2", name: "B.Tech CS", section: "B", year: "2", studentsCount: 38, owner: "Prof. Amit" },
  { id: "3", name: "Physics Honors", section: "C", year: "1", studentsCount: 52, owner: "Prof. Suresh" },
  { id: "4", name: "MBA", section: "A", year: "3", studentsCount: 41, owner: "Prof. Megha" },
];

const INITIAL_MY_CLASSES = [
  { id: "owner-1", name: "B.Tech CS", section: "A", year: "2", studentsCount: 45, role: "Class Teacher", subject: "Class Coordination" },
];

const INITIAL_STUDENTS = [
    { 
        id: "1", name: "Aarav Sharma", roll: "CS-11", email: "aarav.sharma@attendly.edu", classId: "1", attendance: "94%", 
        marks: { cia1: 4.5, cia2: 4.0, tests: 18, total: 26.5 },
        subjects: [
            { name: "Advanced Calculus", marks: { cia1: 4.5, cia2: 4.0, tests: 18, total: 26.5 }, attendance: "96%" },
            { name: "Quantum Physics", marks: { cia1: 4.0, cia2: 3.5, tests: 15, total: 22.5 }, attendance: "92%" },
            { name: "Digital Systems", marks: { cia1: 5.0, cia2: 4.5, tests: 19, total: 28.5 }, attendance: "94%" },
        ]
    },
    { 
        id: "2", name: "Ishani Patel", roll: "CS-12", email: "ishani.patel@attendly.edu", classId: "1", attendance: "87%", 
        marks: { cia1: 4.0, cia2: 3.5, tests: 16, total: 23.5 },
        subjects: [
            { name: "Advanced Calculus", marks: { cia1: 4.0, cia2: 3.5, tests: 16, total: 23.5 }, attendance: "88%" },
            { name: "Economics", marks: { cia1: 3.5, cia2: 4.0, tests: 14, total: 21.5 }, attendance: "85%" },
        ]
    },
];

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'registry'>('my');
  const [registry, setRegistry] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await academicService.getClasses();
        setRegistry(data || []);
        // In a real scenario, we'd filter by the current user's ID
        setMyClasses(data?.filter((c: any) => c.owner === USER_PROFILE.name) || []);
      } catch (error) {
        console.error("Failed to load classes:", error);
        toast.error("Database connection failed. Falling back to offline mode.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'grid' | 'students'>('grid');
  const [selectedClass, setSelectedClass] = useState<any>(null);

  useEffect(() => {
    if (selectedClass) {
      academicService.getStudentsByClass(selectedClass.id)
        .then(setStudents)
        .catch(err => {
            console.error(err);
            toast.error("Failed to sync student registry");
        });
    }
  }, [selectedClass]);

  const [isAddOpen, setIsAddOpen] = useState(false);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);
    const [isEditingMarks, setIsEditingMarks] = useState<string | null>(null);
    const [tempMarks, setTempMarks] = useState({ cia1: 0, cia2: 0, tests: 0 });
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // New Registry Form State - Autofilled with Profile Name
  const [newRegName, setNewRegName] = useState("");
  const [newRegSection, setNewRegSection] = useState("");
  const [newRegYear, setNewRegYear] = useState("1");
  const [newRegTeacher, setNewRegTeacher] = useState(USER_PROFILE.name);

  const [claimSubject, setClaimSubject] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredRegistry = registry.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.owner.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredMyClasses = myClasses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateRegistry = () => {
      if (!newRegName || !newRegSection || !newRegTeacher) {
          toast.error("Please fill all fields");
          return;
      }

      const generatedId = `reg-${Date.now()}`;
      const newEntry = {
          id: generatedId,
          name: newRegName,
          section: newRegSection,
          year: newRegYear,
          studentsCount: 0,
          owner: newRegTeacher
      };

      setRegistry(prev => [newEntry, ...prev]);
      const myPortfolioEntry = { ...newEntry, role: "Class Teacher", subject: "Class Coordination" };
      setMyClasses(prev => [myPortfolioEntry, ...prev]);

      setIsAddOpen(false);
      setActiveTab('my');
      toast.success(`${newRegName} created & pinned to your portfolio!`);
      setNewRegName("");
      setNewRegSection("");
      setNewRegYear("1");
  };

  const handleClaim = () => {
    if (!claimSubject) {
        toast.error("Please enter a subject name first!");
        return;
    }
    const newClass = { ...selectedClass, id: `claim-${Date.now()}`, role: "Subject Teacher", subject: claimSubject };
    setMyClasses(prev => [newClass, ...prev]);
    setIsClaimOpen(false);
    setClaimSubject("");
    setActiveTab('my');
    toast.success(`Successfully claimed ${selectedClass.name}!`);
  };

  const handleClassClick = (cls: any) => {
    setSelectedClass(cls);
    setView('students');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading("Processing roster...");
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== "");
        if (lines.length < 2) throw new Error("Invalid CSV format");
        const newStudents = lines.slice(1).map((line, i) => {
            const [name, roll, email] = line.split(',').map(v => v.trim());
            return {
                id: `imp-${Date.now()}-${i}`,
                name: name || "Unknown",
                roll: roll || "N/A",
                email: email || "",
                classId: selectedClass?.id,
                attendance: "0%",
                marks: { cia1: 0, cia2: 0, tests: 0, total: 0 },
                subjects: []
            };
        });
        setStudents(prev => [...newStudents, ...prev]);
        setRegistry(prev => prev.map(c => c.id === selectedClass?.id ? { ...c, studentsCount: c.studentsCount + newStudents.length } : c));
        setMyClasses(prev => prev.map(c => c.id === selectedClass?.id ? { ...c, studentsCount: (c.studentsCount || 0) + newStudents.length } : c));
        toast.dismiss();
        toast.success(`Imported ${newStudents.length} students to ${selectedClass?.name}`);
      } catch (err: any) {
        toast.dismiss();
        toast.error("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title={view === 'students' ? `Registry / ${selectedClass?.name}` : "Class Registry"} />
        
        <div className="flex-1 py-8 space-y-6 px-4 md:px-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {view === 'grid' ? (
              <>
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Class Registry</h2>
                    <p className="text-xs font-semibold text-slate-400">Initialize or join existing academic sections</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Find records..." 
                            className="pl-9 w-[260px] border-slate-200 shadow-sm rounded-xl h-11 bg-white focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="h-11 px-5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 shadow-sm transition-all active:scale-95">
                        <Plus className="w-4 h-4 mr-2" /> New Registry
                    </Button>
                </div>
              </>
            ) : (
                <div className="flex items-center justify-between w-full">
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('grid')}
                        className="h-10 px-4 rounded-xl text-slate-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Sections
                    </Button>

                    <div className="flex items-center gap-2">
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                        
                        {/* 🧠 Academic Intelligence Command 🧠 */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="h-10 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95">
                                    <Zap className="w-4 h-4 text-emerald-400" />
                                    Academic Intelligence
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2.5rem] border-slate-200 p-8 bg-white shadow-2xl max-w-lg border border-slate-200/50">
                                <DialogHeader className="mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                        <Zap className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter">Intelligence Console</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Push high-priority milestones to {selectedClass?.name} ({selectedClass?.section})</DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-8">
                                    {/* Exam Scheduler */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Next Examination</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400">Date</Label>
                                                <Input type="date" className="h-11 rounded-xl border-slate-200 font-bold text-sm bg-slate-50 focus:bg-white transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-400">Subject</Label>
                                                <Input placeholder="e.g. Advanced Calculus" className="h-11 rounded-xl border-slate-200 font-bold text-sm bg-slate-50 focus:bg-white transition-all" />
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={async () => {
                                                const date = (document.querySelector('input[type="date"]') as HTMLInputElement)?.value;
                                                const sub = (document.querySelectorAll('input')[2] as HTMLInputElement)?.value;
                                                if (!date || !sub) return toast.error("Complete all fields");
                                                try {
                                                    await academicService.scheduleExam({ 
                                                        class_id: selectedClass.id, 
                                                        subject: sub, 
                                                        exam_date: date,
                                                        room_number: "Trial Hall A"
                                                    });
                                                    toast.success("Exam Milestones Synchronized");
                                                } catch (e) { toast.error("Cloud sync failed"); }
                                            }}
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest shadow-sm"
                                        >
                                            Confirm Exam Schedule
                                        </Button>
                                    </div>

                                    <div className="h-px bg-slate-100" />

                                    {/* Quick Broadcasts */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <UploadCloud className="w-4 h-4 text-emerald-600" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Broadcast Alerts</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button 
                                                variant="outline"
                                                onClick={async () => {
                                                    await academicService.broadcastNotification({
                                                        title: "Exam Fee Reminder",
                                                        message: `Academic fees for ${selectedClass?.name} must be cleared by Friday for hall ticket access.`,
                                                        type: "finance"
                                                    });
                                                    toast.success("Fee Reminders Dispatched");
                                                }}
                                                className="h-12 rounded-[1.25rem] border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 flex flex-col items-center justify-center p-0 gap-1"
                                            >
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Fee Alert</span>
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={async () => {
                                                    await academicService.broadcastNotification({
                                                        title: "Trial Period Update",
                                                        message: "Real-time attendance tracking is now live for your section. Please verify your portal.",
                                                        type: "event"
                                                    });
                                                    toast.success("Trial Status Updated");
                                                }}
                                                className="h-12 rounded-[1.25rem] border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 flex flex-col items-center justify-center p-0 gap-1"
                                            >
                                                <Zap className="w-4 h-4 text-emerald-600" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Trial Push</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button 
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 px-4 rounded-xl text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-50 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                        >
                            <UploadCloud className="w-4 h-4" /> Import Roster
                        </Button>
                    </div>
                </div>
            )}
          </div>

          {view === 'grid' && (
              <div className="flex p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/60 shadow-none">
                  <button 
                      onClick={() => setActiveTab('my')}
                      className={cn(
                          "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          activeTab === 'my' ? "bg-white text-blue-600 shadow-sm border border-slate-200/40" : "text-slate-400 hover:text-slate-500"
                      )}
                  >
                      My Portfolio
                  </button>
                  <button 
                      onClick={() => setActiveTab('registry')}
                      className={cn(
                          "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          activeTab === 'registry' ? "bg-white text-blue-600 shadow-sm border border-slate-200/40" : "text-slate-400 hover:text-slate-500"
                      )}
                  >
                      Global Directory
                  </button>
              </div>
          )}

          <AnimatePresence mode="wait">
            {view === 'grid' ? (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                          <div key={i} className="h-64 rounded-[2rem] bg-slate-50 border border-slate-100 animate-pulse relative overflow-hidden">
                             <div className="absolute inset-0 bg-blue-500/5 skeleton-shimmer" />
                          </div>
                        ))
                    ) : activeTab === 'my' ? (
                        <>
                            {filteredMyClasses.map((cls) => (
                                <Card key={cls.id} className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white group hover:shadow-lg transition-all cursor-pointer relative overflow-hidden active:scale-[0.98] border border-slate-200" onClick={() => handleClassClick(cls)}>
                                    <div className="absolute top-0 right-0 p-4">
                                         <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md border", cls.role === 'Class Teacher' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                                            {cls.role}
                                         </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 mb-5 group-hover:rotate-3 transition-transform shadow-sm">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 pr-8">{cls.name} <span className="text-slate-400 text-xs ml-1 font-medium italic">Yr {cls.year}</span></h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{cls.subject}</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-xs font-semibold text-slate-500">{cls.studentsCount || 0} Students</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-slate-300 text-[9px] uppercase tracking-tighter">
                                            SEC {cls.section} <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            <button onClick={() => setIsAddOpen(true)} className="p-6 border-2 border-dashed border-slate-200 rounded-2xl group hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center text-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all shadow-none">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Add Registry</p>
                            </button>
                        </>
                    ) : (
                        filteredRegistry.map((cls) => (
                            <Card key={cls.id} className="p-6 border-slate-200 shadow-sm rounded-2xl bg-white relative group transition-all hover:bg-slate-50/30 active:scale-95 border border-slate-200">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shadow-sm">
                                        <Briefcase className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <Button onClick={() => { setSelectedClass(cls); setIsClaimOpen(true); }} variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                                        Claim
                                    </Button>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">{cls.name} <span className="text-slate-400 text-xs ml-1 font-medium">Yr {cls.year}</span></h3>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-6 tracking-wide">Section {cls.section}</p>
                                <div className="mt-auto flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-100 shadow-sm">
                                        {cls.owner.charAt(6)}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5 tracking-tighter">Class Teacher</p>
                                        <p className="text-xs font-semibold text-slate-700 truncate">{cls.owner}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <div className="flex items-center gap-5 p-7 rounded-[2rem] bg-slate-900 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold tracking-tight">{selectedClass?.name} - Section {selectedClass?.section}</h2>
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded-md shadow-sm">
                                    Year {selectedClass?.year}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Head Librarian: {selectedClass?.owner || selectedClass?.role || USER_PROFILE.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatusStat label="Total Records" value={students.filter(s => s.classId === selectedClass?.id).length || selectedClass?.studentsCount || 0} icon={Users} color="blue" />
                        <StatusStat label="Target Section" value={selectedClass?.section} icon={Target} color="indigo" />
                        <StatusStat label="Academic Cycle" value={`Year ${selectedClass?.year}`} icon={Zap} color="amber" />
                        <StatusStat label="Health Status" value="Verified" icon={Trophy} color="emerald" />
                    </div>

                    <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll No</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CIA Marks</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-12">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.filter(s => s.classId === selectedClass?.id).length > 0 ? (
                                        students.filter(s => s.classId === selectedClass?.id).map((student) => (
                                            <Dialog key={student.id}>
                                                <DialogTrigger
                                                    render={
                                                        <tr className="hover:bg-blue-50/40 transition-colors group cursor-pointer">
                                                            <td className="px-6 py-4 text-sm font-bold text-slate-500">{student.roll}</td>
                                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{student.name}</td>
                                                            <td className="px-6 py-4 text-xs font-medium text-slate-400">{student.email}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200/50">
                                                                    {student.marks?.total || '0.0'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right pr-8">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shadow-sm">{student.attendance}</span>
                                                                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-400 transition-colors" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    }
                                                />
                                                <DialogContent className="rounded-3xl p-0 border-slate-200 shadow-2xl max-w-2xl overflow-hidden bg-white">
                                                    <div className="flex flex-col h-[85vh]">
                                                        {/* Header Section */}
                                                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-xl shadow-blue-100">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <DialogTitle className="text-2xl font-bold text-slate-900">{student.name}</DialogTitle>
                                                                    <DialogDescription className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2 mt-1">
                                                                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Roll: {student.roll}</span>
                                                                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">B.Tech YR {selectedClass?.year}</span>
                                                                    </DialogDescription>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Scrollable Content */}
                                                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                                            {/* Holistic Stats */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Academic CGPA</p>
                                                                    <p className="text-3xl font-bold text-slate-900">8.84 <span className="text-sm text-slate-300 font-medium ml-1">/ 10</span></p>
                                                                </div>
                                                                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overall Presence</p>
                                                                    <p className="text-3xl font-bold text-blue-600">{student.attendance}</p>
                                                                </div>
                                                            </div>

                                                            {/* All Subjects Breakdown */}
                                                            <div className="space-y-6">
                                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Subject-wise Assessment</h4>
                                                                {(student.subjects || [{ name: selectedClass?.name || "Major Subject", marks: student.marks, attendance: student.attendance }]).map((sub: any, idx: number) => (
                                                                    <Card key={idx} className="p-6 border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all border border-slate-100 group">
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <div>
                                                                                <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{sub.name}</h5>
                                                                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Attendance: {sub.attendance}</p>
                                                                            </div>
                                                                            
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="sm" 
                                                                                onClick={() => {
                                                                                    if (isEditingMarks === `${student.id}-${idx}`) {
                                                                                        setIsEditingMarks(null);
                                                                                        toast.success(`Academic records updated for ${sub.name}`);
                                                                                    } else {
                                                                                        setIsEditingMarks(`${student.id}-${idx}`);
                                                                                        setTempMarks({ 
                                                                                            cia1: sub.marks?.cia1 || 0, 
                                                                                            cia2: sub.marks?.cia2 || 0, 
                                                                                            tests: sub.marks?.tests || 0 
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                                            >
                                                                                {isEditingMarks === `${student.id}-${idx}` ? 'Save' : 'Update'}
                                                                            </Button>
                                                                        </div>

                                                                        <div className="space-y-6">
                                                                            {isEditingMarks === `${student.id}-${idx}` ? (
                                                                                <div className="space-y-4">
                                                                                    <MarkInput label="CIA 1" val={tempMarks.cia1} max={5} onChange={(v: number) => setTempMarks({...tempMarks, cia1: v})} />
                                                                                    <MarkInput label="CIA 2" val={tempMarks.cia2} max={5} onChange={(v: number) => setTempMarks({...tempMarks, cia2: v})} />
                                                                                    <MarkInput label="Tests" val={tempMarks.tests} max={10} onChange={(v: number) => setTempMarks({...tempMarks, tests: v})} />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="space-y-6">
                                                                                    <MarksBar label="Internal Assessment" value={sub.marks?.cia1 + sub.marks?.cia2} max={10} color="bg-blue-500" />
                                                                                    <MarksBar label="Final Tests (Reduced)" value={sub.marks?.tests} max={10} color="bg-emerald-500" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Footer Actions */}
                                                        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex gap-4">
                                                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-sm text-slate-600 shadow-sm bg-white">
                                                                Performance PDF
                                                            </Button>
                                                            <Button className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:shadow-slate-200 transition-all">
                                                                Contact Guardian
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 text-sm font-medium italic">No students found in this registry. Use the CSV import to initialize your roster.</td></tr>
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
            <DialogContent className="rounded-2xl border-slate-200 max-w-md p-8 bg-white border border-slate-200/50 shadow-2xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">New Class Registry</DialogTitle>
                    <DialogDescription className="text-slate-400 font-semibold uppercase tracking-widest text-[9px]">Initialize a master roster for an academic section.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Degree / Department</Label>
                        <Input value={newRegName} onChange={(e) => setNewRegName(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="h-11 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/5 font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Section Code</Label>
                            <Input value={newRegSection} onChange={(e) => setNewRegSection(e.target.value)} placeholder="e.g. A" className="h-11 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/5 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Current Year</Label>
                            <Select value={newRegYear} onValueChange={(val) => val && setNewRegYear(val)}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 font-semibold focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-700">
                                    <SelectValue placeholder="Cycle" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200/60 shadow-xl">
                                    <SelectItem value="1" className="font-semibold text-xs">1st Year (FY)</SelectItem>
                                    <SelectItem value="2" className="font-semibold text-xs">2nd Year (SY)</SelectItem>
                                    <SelectItem value="3" className="font-semibold text-xs">3rd Year (TY)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Class Teacher</Label>
                        <Input value={newRegTeacher} onChange={(e) => setNewRegTeacher(e.target.value)} placeholder="Facilitator Name" className="h-11 rounded-xl border-slate-200 font-semibold bg-slate-50/50" />
                    </div>
                </div>
                <DialogFooter className="mt-8 flex gap-3">
                    <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="h-11 rounded-xl font-bold text-sm text-slate-400 hover:text-slate-900 border border-transparent hover:bg-slate-50">Discard</Button>
                    <Button onClick={handleCreateRegistry} className="h-11 rounded-xl bg-slate-900 text-white font-bold px-8 hover:bg-slate-800 shadow-lg shadow-slate-200/50 transition-all flex-1">
                        Create & Pin Section
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Claim Dialog */}
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
            <DialogContent className="rounded-2xl border-slate-200 max-w-md p-8 bg-white shadow-2xl border border-slate-200/50">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Claim Subject</DialogTitle>
                    <DialogDescription className="text-slate-400 font-semibold uppercase tracking-widest text-[9px]">Join {selectedClass?.name} as a guest lecturer or subject teacher.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-extrabold uppercase text-slate-500">Academic Subject</Label>
                        <Input value={claimSubject} onChange={(e) => setClaimSubject(e.target.value)} placeholder="e.g. Distributed Systems" className="h-11 rounded-xl border-slate-200 focus:ring-4 focus:ring-blue-500/5 font-medium" />
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button onClick={handleClaim} className="w-full h-11 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-200/50 transition-all">
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
        <Card className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center gap-4 group hover:border-slate-300 transition-colors">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{value}</p>
            </div>
        </Card>
    );
}

function MarksBar({ label, value, max, color }: any) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-slate-900">{value} <span className="text-slate-300 font-medium">/ {max}</span></span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className={cn("h-full rounded-full shadow-inner", color)} />
            </div>
        </div>
    );
}

function MarkInput({ label, val, max, onChange }: any) {
    return (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider shrink-0">{label}</span>
            <div className="flex items-center gap-2">
                <Input 
                    type="number" 
                    step="0.5"
                    min="0"
                    max={max}
                    value={val}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="h-8 w-16 text-right rounded-lg border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 shadow-sm" 
                />
                <span className="text-xs font-bold text-slate-300">/ {max}</span>
            </div>
        </div>
    );
}
