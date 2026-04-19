"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Library, Plus, Search, Filter, BookOpen, Hash, Layers, ShieldAlert, RefreshCcw } from "lucide-react";
import { subjectService, Subject } from "@/services/subjects";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const router = useRouter();

  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    department: "BCOM",
    year: 1,
    semester: 1
  });

  useEffect(() => {
    checkAdmin();
    loadSubjects();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'ADMIN') {
        setIsAdmin(false);
        toast.error("Administrative Privileges Required");
        router.push("/dashboard");
    } else {
        setIsAdmin(true);
    }
  };

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newSubject.name || !newSubject.code) return toast.error("Essential fields missing");
    setIsSubmitting(true);
    try {
        await subjectService.createSubject(newSubject);
        toast.success("Subject Registered Successfully");
        setIsAddOpen(false);
        setNewSubject({
            name: "",
            code: "",
            department: "BCOM",
            year: 1,
            semester: 1
        });
        loadSubjects();
    } catch (err: any) {
        toast.error("Creation failed", { description: err.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.updateSubject(editingSubject.id, {
        name: editingSubject.name,
        code: editingSubject.code,
        department: editingSubject.department,
        year: editingSubject.year,
        semester: editingSubject.semester
      });
      toast.success("Subject Blueprint Updated");
      setIsEditOpen(false);
      loadSubjects();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
      const matchesDept = selectedDept === "all" || s.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [subjects, search, selectedDept]);

  if (isAdmin === false) return null;
  if (loading || isAdmin === null) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Master Registry</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Header
          title={
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-black text-xl tracking-tight uppercase">Subject Registry</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{subjects.length} Blueprints</span>
            </div>
          }
        />

        <div className="flex-1 overflow-hidden flex flex-col pt-6 pb-24 px-4 md:px-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search code or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm font-bold"
                />
              </div>
              
              <Select value={selectedDept} onValueChange={(v) => v && setSelectedDept(v)}>
                <SelectTrigger className="w-[180px] h-12 bg-white border-slate-200 rounded-2xl shadow-sm font-black uppercase tracking-wider text-xs">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="BCOM">BCOM</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="Commerce">Commerce</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setIsAddOpen(true)} className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95">
              <Plus className="w-5 h-5" />
              New Subject
            </Button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="p-8">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black tracking-tight uppercase">Register Subject</DialogTitle>
                    <DialogDescription className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                      Add a new course blueprint to the institutional registry.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Identity</label>
                            <Input 
                                placeholder="e.g. Accounting" 
                                className="h-12 rounded-xl border-slate-200 font-bold"
                                value={newSubject.name}
                                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
                            <Input 
                                placeholder="e.g. BCM101" 
                                className="h-12 rounded-xl border-slate-200 font-bold"
                                value={newSubject.code}
                                onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Department</label>
                        <Select value={newSubject.department} onValueChange={(v) => v && setNewSubject({...newSubject, department: v})}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Year</label>
                            <Select value={String(newSubject.year)} onValueChange={(v) => v && setNewSubject({...newSubject, year: parseInt(v)})}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="1">Year 1</SelectItem>
                                    <SelectItem value="2">Year 2</SelectItem>
                                    <SelectItem value="3">Year 3</SelectItem>
                                    <SelectItem value="4">Year 4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                            <Select value={String(newSubject.semester)} onValueChange={(v) => v && setNewSubject({...newSubject, semester: parseInt(v)})}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
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
                </div>
                <div className="p-8 pt-0">
                    <Button 
                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                        onClick={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Finalizing..." : "Create Blueprint"}
                    </Button>
                </div>
              </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
                {editingSubject && (
                  <>
                    <div className="p-8">
                      <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black tracking-tight uppercase">Update Blueprint</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                          Refine course identity and academic mapping.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Identity</label>
                                <Input 
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                    value={editingSubject.name}
                                    onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Code</label>
                                <Input 
                                    className="h-12 rounded-xl border-slate-200 font-bold"
                                    value={editingSubject.code}
                                    onChange={(e) => setEditingSubject({...editingSubject, code: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Department</label>
                            <Select value={editingSubject.department} onValueChange={(v) => v && setEditingSubject({...editingSubject, department: v})}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Year</label>
                                <Select value={String(editingSubject.year)} onValueChange={(v) => v && setEditingSubject({...editingSubject, year: parseInt(v)})}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {[1,2,3,4].map(y => (
                                            <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                <Select value={String(editingSubject.semester)} onValueChange={(v) => v && setEditingSubject({...editingSubject, semester: parseInt(v)})}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
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
                    </div>
                    <div className="p-8 pt-0">
                        <Button 
                            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                            onClick={handleUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Blueprint"}
                        </Button>
                    </div>
                  </>
                )}
              </DialogContent>
          </Dialog>

          <Card className="flex-1 rounded-[2.5rem] overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredSubjects.map((s, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={s.id}
                      className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Library className="w-16 h-16 text-blue-900" />
                      </div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                           <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           {s.code}
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2 uppercase">{s.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                           <Layers className="w-3.5 h-3.5" />
                           {s.department}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                           <Hash className="w-3.5 h-3.5" />
                           Year {s.year} • Sem {s.semester}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Active Course</span>
                         </div>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setEditingSubject(s);
                                setIsEditOpen(true);
                            }}
                            className="h-8 rounded-lg text-xs font-black text-blue-600 hover:bg-blue-100/50"
                        >
                            Edit Mapping
                         </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredSubjects.length === 0 && !loading && (
                    <div className="col-span-full py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Filter className="w-10 h-10" />
                        </div>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">No blueprints match your criteria</p>
                        <p className="text-sm font-bold text-slate-400 mt-1">Refine your filters or create a new registry entry</p>
                    </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
