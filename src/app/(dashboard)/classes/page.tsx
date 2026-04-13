"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, GraduationCap, Users, Pencil, Trash2, Calendar, Clock, ChevronRight, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CLASSES_REGISTRY = [
  { id: "1", name: "B.Tech CS - Sem 4", section: "A", studentsCount: 45, owner: "Prof. Sneha (Mentor)" },
  { id: "2", name: "B.Tech CS - Sem 4", section: "B", studentsCount: 38, owner: "Prof. Amit (Mentor)" },
  { id: "3", name: "Physics Honors - Sem 1", section: "C", studentsCount: 52, owner: "Prof. Suresh (Mentor)" },
  { id: "4", name: "MBA - Sem 2", section: "A", studentsCount: 41, owner: "Prof. Megha (Mentor)" },
];

const MY_INITIAL_CLASSES = [
  { id: "owner-1", name: "B.Tech CS - Sem 4", section: "A", studentsCount: 45, role: "Mentor", subject: "Class Coordination" },
];

const STUDENTS_MOCK = [
    { id: "1", name: "Aarav Sharma", roll: "CS-11", email: "aarav.sharma@attendly.edu", classId: "1", attendance: "94%" },
    { id: "2", name: "Ishani Patel", roll: "CS-12", email: "ishani.patel@attendly.edu", classId: "1", attendance: "87%" },
    { id: "3", name: "Vihaan Gupta", roll: "CS-13", email: "vihaan.gupta@attendly.edu", classId: "1", attendance: "79%" },
    { id: "4", name: "Ananya Iyer", roll: "CS-14", email: "ananya.iyer@attendly.edu", classId: "1", attendance: "91%" },
    { id: "5", name: "Arjun Reddy", roll: "CS-15", email: "arjun.reddy@attendly.edu", classId: "2", attendance: "83%" },
    { id: "6", name: "Saanvi Nair", roll: "CS-16", email: "saanvi.nair@attendly.edu", classId: "2", attendance: "96%" },
];

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'registry'>('my');
  const [myClasses, setMyClasses] = useState(MY_INITIAL_CLASSES);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<'grid' | 'students'>('grid');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [claimSubject, setClaimSubject] = useState("");

  const filteredRegistry = CLASSES_REGISTRY.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.owner.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredMyClasses = myClasses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  
  const handleClaim = () => {
    if (!claimSubject) {
        toast.error("Please enter a subject name first!");
        return;
    }
    
    const newClass = {
        ...selectedClass,
        id: `claim-${Date.now()}`,
        role: "Subject Teacher",
        subject: claimSubject
    };
    
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

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title={view === 'students' ? `Registry / ${selectedClass?.name}` : "Class Registry"} />
        
        <div className="flex-1 py-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {view === 'grid' ? (
              <>
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Class Registry</h2>
                    <p className="text-xs font-semibold text-slate-400">Initialize or join existing sections</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search records..." 
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
                <Button 
                    variant="ghost" 
                    onClick={() => setView('grid')}
                    className="h-10 px-4 rounded-lg text-slate-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                    <Plus className="w-4 h-4 rotate-45" /> Back to Dashboard
                </Button>
            )}
          </div>

          {view === 'grid' && (
              <div className="flex p-1 bg-slate-50 rounded-xl w-fit border border-slate-200 shadow-sm">
                  <button 
                      onClick={() => setActiveTab('my')}
                      className={cn(
                          "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          activeTab === 'my' ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-500"
                      )}
                  >
                      My Portfolio
                  </button>
                  <button 
                      onClick={() => setActiveTab('registry')}
                      className={cn(
                          "px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                          activeTab === 'registry' ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-500"
                      )}
                  >
                      Global Registry
                  </button>
              </div>
          )}

          <AnimatePresence mode="wait">
            {view === 'grid' ? (
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {activeTab === 'my' ? (
                        <>
                            {filteredMyClasses.map((cls) => (
                                <Card 
                                    key={cls.id} 
                                    className="p-6 border-slate-200 shadow-sm rounded-xl bg-white group hover:shadow-lg transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                    onClick={() => handleClassClick(cls)}
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                         <span className={cn(
                                             "px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-md border",
                                             cls.role === 'Mentor' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                         )}>
                                            {cls.role}
                                         </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-5 group-hover:rotate-3 transition-transform">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-1 pr-8">{cls.name}</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{cls.subject}</span>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-semibold text-slate-700">{cls.studentsCount} Students</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-slate-300 text-[9px] uppercase">
                                            SEC {cls.section} <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            <button 
                                onClick={() => setIsAddOpen(true)}
                                className="p-6 border-2 border-dashed border-slate-200 rounded-xl group hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Add Section</p>
                            </button>
                        </>
                    ) : (
                        filteredRegistry.map((cls) => (
                            <Card 
                                key={cls.id} 
                                className="p-6 border-slate-200 shadow-sm rounded-xl bg-white relative group transition-all hover:bg-slate-50/20 active:scale-95"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <Button 
                                        onClick={() => { setSelectedClass(cls); setIsClaimOpen(true); }}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        Claim
                                    </Button>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">{cls.name}</h3>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-6">Section {cls.section}</p>
                                
                                <div className="mt-auto flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold text-[10px] border border-slate-100">
                                        {cls.owner.substring(5, 6)}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Mentor</p>
                                        <p className="text-xs font-semibold text-slate-700 truncate">{cls.owner}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-5 p-7 rounded-2xl bg-slate-900 text-white shadow-lg">
                        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold">{selectedClass?.name}</h2>
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded">
                                    {selectedClass?.role}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">Class Registry Info & Student Roster</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-5 rounded-xl border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Students</p>
                            <p className="text-xl font-bold text-slate-900">{selectedClass?.studentsCount}</p>
                        </Card>
                        <Card className="p-5 rounded-xl border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Section</p>
                            <p className="text-xl font-bold text-slate-900">{selectedClass?.section}</p>
                        </Card>
                        <Card className="p-5 rounded-xl border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. Attendance</p>
                            <p className="text-xl font-bold text-emerald-600">89%</p>
                        </Card>
                        <Card className="p-5 rounded-xl border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                            <p className="text-xl font-bold text-blue-600">Active</p>
                        </Card>
                    </div>

                    <Card className="border-slate-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Roll No</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Full Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Email</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Attendance</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {STUDENTS_MOCK.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{student.roll}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{student.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{student.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{student.attendance}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Dialogs - Simplified Styling */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="rounded-2xl border-slate-200 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Registry</DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium">Initialize a master roster for your section.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Section Name</Label>
                        <Input placeholder="e.g. B.Tech CS - Sem 4" className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Section</Label>
                            <Input placeholder="e.g. A" className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Mentor Name</Label>
                            <Input placeholder="e.g. Prof. Smith" className="rounded-xl" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                    <Button className="rounded-xl bg-slate-900 text-white font-bold px-8">Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
            <DialogContent className="rounded-2xl border-slate-200 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Claim Section</DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium">Join {selectedClass?.name} as a Subject Teacher.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Subject Name</Label>
                        <Input 
                            value={claimSubject}
                            onChange={(e) => setClaimSubject(e.target.value)}
                            placeholder="e.g. Advanced Calculus" 
                            className="rounded-xl border-slate-200 focus:ring-blue-500/10" 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsClaimOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                    <Button 
                        onClick={handleClaim}
                        className="rounded-xl bg-blue-600 text-white font-bold px-8 hover:bg-blue-700 shadow-md shadow-blue-200"
                    >
                        Initialize Claim
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
