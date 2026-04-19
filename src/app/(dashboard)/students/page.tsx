"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, UploadCloud, FileSpreadsheet, UserRoundPen, History, Trash2, AlertCircle, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fuzzySearch, cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "@/components/students/student-profile";
import { academicService } from "@/services/academic";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [studentList, setStudentList] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form States
  const [formData, setFormData] = useState<{ name: string, roll: string, email: string, class: string, parent_email: string }>({
    name: "", roll: "", email: "", class: "", parent_email: ""
  });

  const handleFormChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const loadData = async (p = page) => {
    try {
      setLoading(true);
      const [result, clsList] = await Promise.all([
        academicService.getAllStudents(p, PAGE_SIZE),
        academicService.getClasses()
      ]);
      setStudentList(result.data || []);
      setTotalCount(result.count || 0);
      setClasses(clsList || []);
    } catch (err) {
      toast.error("Failed to load records from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(page); }, [page]);

  const filteredStudents = studentList.filter(s => {
    const matchesSearch = fuzzySearch(search, `${s.name} ${s.roll_number} ${s.email}`);
    const matchesSection = selectedSection === "all" || s.classes?.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const [importStatus, setImportStatus] = useState<'idle' | 'reading' | 'mapping' | 'success'>('idle');
  const [importProgress, setImportProgress] = useState(0);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.class) return toast.error("Please select a target class first");

    setIsUploading(true);
    setImportStatus('reading');
    setImportProgress(10);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImportStatus('mapping');
        setImportProgress(30);

        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== "");
        if (lines.length < 2) throw new Error("File is empty or missing data.");

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const required = ['name', 'roll', 'email'];

        const missing = required.filter(r => !headers.includes(r));
        if (missing.length > 0) throw new Error(`Missing required headers: ${missing.join(", ")}`);

        const nameIdx = headers.indexOf('name');
        const rollIdx = headers.indexOf('roll');
        const emailIdx = headers.indexOf('email');
        const parentIdx = headers.indexOf('parent_email');
        const tcIdx = headers.indexOf('tc');
        const tpIdx = headers.indexOf('tp');

        const headerIndices: Record<string, number> = {};
        headers.forEach((h, i) => { headerIndices[h] = i; });

        const tcCols = headers.filter(h => h.startsWith('tc_'));
        const subjectList = await academicService.getSubjects({ department: classes.find(c => c.id === formData.class)?.department });

        const newStudentsData = lines.slice(1).map((line) => {
          const values = line.split(',').map(v => v.trim());
          const student = {
            name: values[headerIndices['name']],
            roll_number: values[headerIndices['roll']],
            email: values[headerIndices['email']],
            parent_email: headerIndices['parent_email'] !== undefined ? values[headerIndices['parent_email']] : null,
            initial_total_classes: headerIndices['tc'] !== undefined ? parseInt(values[headerIndices['tc']]) || 0 : 0,
            initial_total_present: headerIndices['tp'] !== undefined ? parseInt(values[headerIndices['tp']]) || 0 : 0,
            class_id: formData.class,
            department: classes.find(c => c.id === formData.class)?.department || 'General'
          };

          const initialAttendance = tcCols.map(tcCol => {
            const suffix = tcCol.replace('tc_', '').toLowerCase();
            const tpCol = `tp_${suffix}`;

            // Try to find a matching subject
            const matchedSubject = subjectList.find(s =>
              s.code.toLowerCase().includes(suffix) ||
              s.name.toLowerCase().includes(suffix)
            );

            return {
              subject_code: matchedSubject ? matchedSubject.code : suffix.toUpperCase(),
              total_classes: parseInt(values[headerIndices[tcCol]]) || 0,
              total_present: parseInt(values[headerIndices[tpCol]]) || 0
            };
          });

          return { student, initialAttendance };
        });

        setImportProgress(60);
        const studentsToInsert = newStudentsData.map(d => d.student);
        const insertedStudents = await academicService.importStudents(studentsToInsert);

        // Map initial attendance to student IDs
        const initialRecords: any[] = [];
        insertedStudents.forEach((st: any) => {
          const original = newStudentsData.find(d => d.student.roll_number === st.roll_number);
          if (original) {
            original.initialAttendance.forEach(rec => {
              initialRecords.push({
                student_id: st.id,
                ...rec
              });
            });
          }
        });

        if (initialRecords.length > 0) {
          await academicService.importInitialAttendance(initialRecords);
        }

        setImportProgress(100);
        setImportStatus('success');
        toast.success(`Successfully synchronized ${newStudents.length} students to the cloud.`);
        loadData();
        setTimeout(() => {
          setIsImportOpen(false);
          setIsUploading(false);
        }, 1000);

      } catch (err: any) {
        toast.error("Format Error", { description: err.message });
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.roll || !formData.class) return toast.error("Missing required fields");
    try {
      await academicService.addStudent({
        name: formData.name,
        roll_number: formData.roll,
        email: formData.email,
        parent_email: formData.parent_email,
        class_id: formData.class,
        department: classes.find(c => c.id === formData.class)?.department || 'General'
      });
      toast.success("Student records persisted to database");
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      toast.error("Failed to create record");
    }
  };

  const handleUpdate = async () => {
    try {
      await academicService.updateStudent(selectedStudent.id, {
        name: formData.name,
        roll_number: formData.roll,
        email: formData.email,
        parent_email: formData.parent_email
      });
      toast.success("Profile updated in registry");
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    try {
      await academicService.deleteStudent(selectedStudent.id);
      toast.success("Record purged from database");
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const handleAction = (type: 'edit' | 'history' | 'delete', student: any) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      roll: student.roll_number,
      email: student.email,
      class: student.class_id,
      parent_email: student.parent_email || ""
    });
    if (type === 'edit') setIsEditOpen(true);
    if (type === 'history') setIsHistoryOpen(true);
    if (type === 'delete') setIsDeleteOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Institutional Roster</p>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Header title="Institutional Roster" />

        <div className="flex-1 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 bg-slate-900 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center gap-4 lg:gap-6 flex-1 w-full">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Identify student node..."
                  className="pl-11 w-full border-none bg-white/10 text-white placeholder:text-slate-500 font-bold h-12 md:h-14 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[120px] border-none bg-white/10 text-white font-bold h-12 md:h-14 rounded-xl md:rounded-2xl">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="A">Sec A</SelectItem>
                    <SelectItem value="B">Sec B</SelectItem>
                    <SelectItem value="C">Sec C</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                  <DialogTrigger render={
                    <Button variant="ghost" className="h-12 md:h-14 flex-1 md:flex-none rounded-xl md:rounded-2xl text-slate-400 font-bold text-[9px] md:text-xs gap-2 md:gap-3 hover:text-white hover:bg-white/5 uppercase tracking-widest px-4 md:px-6">
                      <UploadCloud className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> <span className="hidden sm:inline">Bulk</span> Import
                    </Button>
                  } />
                  <DialogContent className="w-[95vw] max-w-[450px] rounded-[2rem] md:rounded-[2.5rem] p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl">
                    <div className="p-6 md:p-8 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="text-xl md:text-2xl font-black uppercase">Ingest Data</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold text-xs">
                          Upload your class registry to instantly sync with the cloud.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</Label>
                        <Select onValueChange={(v) => v && handleFormChange('class', String(v))}>
                          <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-sm">
                            <SelectValue placeholder="Select Classroom" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 p-2">
                            {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-3 mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required CSV Columns</p>
                        <div className="flex flex-wrap gap-2">
                          {['name', 'roll', 'email'].map(col => (
                            <span key={col} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 shadow-sm">{col}</span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="csv-upload" className="block p-6 md:p-10 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group text-center bg-slate-50/30">
                          <div className="flex flex-col items-center gap-3">
                            <UploadCloud className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            <div>
                              <p className="text-xs md:text-sm font-bold text-slate-600">Click to upload CSV</p>
                            </div>
                          </div>
                          <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={isUploading || !formData.class} />
                        </Label>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger render={
                    <Button
                      onClick={() => setFormData({ name: "", roll: "", email: "", class: "", parent_email: "" })}
                      className="h-12 md:h-14 flex-[1.5] md:flex-none rounded-xl md:rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest hover:bg-slate-100 shadow-xl transition-all px-4 md:px-8 gap-2 text-[9px] md:text-xs"
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Enroll <span className="hidden sm:inline">Student</span>
                    </Button>
                  } />
                  <DialogContent className="w-[95vw] max-w-[500px] rounded-[2rem] md:rounded-[2.5rem] p-0 overflow-hidden bg-white border border-slate-200">
                    <div className="p-6 md:p-8">
                      <DialogHeader className="mb-6 md:mb-8 text-center">
                        <DialogTitle className="text-xl md:text-2xl font-black uppercase">New Enrollment</DialogTitle>
                        <DialogDescription className="font-bold text-slate-400 text-xs">Enter personal and academic coordinates.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2 col-span-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</Label>
                          <Input placeholder="John Doe" className="h-12 rounded-xl md:rounded-2xl border-slate-200 font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll Number</Label>
                          <Input placeholder="U03FS23S0134" className="h-12 rounded-xl md:rounded-2xl border-slate-200 font-bold text-sm" value={formData.roll} onChange={e => setFormData({ ...formData, roll: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classroom</Label>
                          <Select onValueChange={(v) => v && handleFormChange('class', String(v))}>
                            <SelectTrigger className="h-12 rounded-xl md:rounded-2xl border-slate-200 font-bold text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl p-2">
                              {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</Label>
                          <Input placeholder="student@edu.com" className="h-12 rounded-xl md:rounded-2xl border-slate-200 font-bold text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 pt-0 flex flex-col gap-3">
                      <Button className="h-14 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10" onClick={handleCreate}>Finalize Enrollment</Button>
                      <Button variant="ghost" className="h-10 rounded-xl text-slate-400 font-bold text-xs" onClick={() => setIsAddOpen(false)}>Discard</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Card className="border border-slate-100 shadow-sm rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[10px] uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100 font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Full Identity</th>
                    <th className="px-8 py-5">Roll Unit</th>
                    <th className="px-8 py-5">Classroom</th>
                    <th className="px-8 py-5">Department</th>
                    <th className="px-8 py-5 w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => { setSelectedStudent(st); setIsProfileOpen(true); }}>
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900 leading-tight">{st.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter">{st.email}</div>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-700">{st.roll_number}</td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-700 border border-slate-100 shadow-sm">
                          {st.classes?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-slate-400 text-xs uppercase tracking-widest">
                        {st.department || 'General'}
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-slate-100 outline-none">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white border border-slate-100 shadow-2xl">
                            <DropdownMenuItem onClick={() => handleAction('edit', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs">
                              <UserRoundPen className="w-4 h-4 text-blue-600" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('history', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs">
                              <History className="w-4 h-4 text-emerald-600" /> Attendance Ledger
                            </DropdownMenuItem>
                            <div className="h-px bg-slate-50 my-2" />
                            <DropdownMenuItem onClick={() => handleAction('delete', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50/50">
                              <Trash2 className="w-4 h-4" /> Purge Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredStudents.map((st) => (
                <div key={st.id} className="p-5 space-y-4 active:bg-slate-50 transition-colors" onClick={() => { setSelectedStudent(st); setIsProfileOpen(true); }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-black text-slate-900 leading-tight text-base truncate uppercase">{st.name}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5 truncate lowercase">{st.email}</div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="h-9 w-9 rounded-xl hover:bg-slate-100 outline-none border border-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white border border-slate-100 shadow-2xl">
                          <DropdownMenuItem onClick={() => handleAction('edit', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs">
                            <UserRoundPen className="w-4 h-4 text-blue-600" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('history', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs">
                            <History className="w-4 h-4 text-emerald-600" /> Attendance Ledger
                          </DropdownMenuItem>
                          <div className="h-px bg-slate-50 my-2" />
                          <DropdownMenuItem onClick={() => handleAction('delete', st)} className="rounded-xl p-3 flex items-center gap-3 font-bold text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50/50">
                            <Trash2 className="w-4 h-4" /> Purge Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-700 tracking-tighter">{st.roll_number}</span>
                    <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-black uppercase text-blue-600 tracking-tighter">{st.classes?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-[3rem] p-0 overflow-hidden bg-white border border-slate-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 rounded-[2.5rem] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-50/50">
                <Trash2 className="w-10 h-10" />
              </div>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-center">PURGE STUDENT?</DialogTitle>
                <DialogDescription className="text-center font-bold text-slate-400">
                  Irreversible action. Deleting {selectedStudent?.name} will wipe all associated trail-run data.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Button className="h-14 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-500/10" onClick={handleDelete}>Confirm Purge</Button>
                <Button variant="ghost" className="h-12 rounded-xl text-slate-400 font-bold text-xs" onClick={() => setIsDeleteOpen(false)}>Abort Action</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isProfileOpen && (
          <StudentProfile student={selectedStudent} onClose={() => setIsProfileOpen(false)} />
        )}
      </div>
    </PageTransition>
  );
}
