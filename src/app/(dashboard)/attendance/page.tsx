"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, UserCheck, WifiOff, CloudUpload, CheckCircle2, CalendarIcon, Search, AlertCircle, Bell, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { offlineService } from "@/services/offline";
import { haptics } from "@/lib/haptics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, fuzzySearch } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "@/components/students/student-profile";
import { academicService } from "@/services/academic";
import { subjectService, Subject } from "@/services/subjects";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            
            // ROLE SENTINEL: Redirection for non-faculty
            if (profile?.role === 'STUDENT') {
                router.push("/student/dashboard");
                return;
            } else if (profile?.role === 'PARENT') {
                router.push("/parent/dashboard");
                return;
            }

            // If teacher/admin, continue loading institutional data
            const data = await academicService.getClasses();
            setClasses(data || []);
            if (data && data.length > 0) setSelectedClassId(data[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (selectedClassId) {
        setLoading(true);
        // 1. Fetch Students
        academicService.getStudentsByClass(selectedClassId)
            .then(data => {
                setStudents(data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // 2. Fetch Subjects for this Class (Year/Sem)
        const currentClass = classes.find(c => c.id === selectedClassId);
        if (currentClass) {
            subjectService.getSubjects({ 
                department: currentClass.department, 
                year: currentClass.year,
                semester: 1 // Default to 1, can be dynamic later
            }).then(data => setSubjects(data || []));
        }
    }
  }, [selectedClassId, classes]);

  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [entryMode, setEntryMode] = useState<'list' | 'grid'>('list');
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [onDutyIds, setOnDutyIds] = useState<Set<string>>(new Set());
  const [medicalIds, setMedicalIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState("L1");

  // --- Auto-Draft Persistence ---
  useEffect(() => {
    if (selectedClassId) {
        const draft = localStorage.getItem(`draft_${selectedClassId}_${selectedLecture}`);
        if (draft) {
            const { absent, od } = JSON.parse(draft);
            setAbsentIds(new Set(absent));
            setOnDutyIds(new Set(od));
            toast.info("Draft Recovered", { description: "Resuming your previous roll call session." });
        }
    }
  }, [selectedClassId, selectedLecture]);

  useEffect(() => {
    if (selectedSubjectId && selectedClassId) {
        checkSubjectLock();
    }
  }, [selectedSubjectId, selectedClassId]);

  const checkSubjectLock = async () => {
    try {
        const assignments = await subjectService.getAssignmentsForClass(selectedClassId);
        const lock = assignments.find((a: any) => a.subject_id === selectedSubjectId);
        setCurrentAssignment(lock || null);
    } catch (err) {
        console.error("Lock Check Failed");
    }
  };

  const handleClaim = async () => {
    if (!selectedSubjectId || !selectedClassId) return;
    setIsClaiming(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");
        
        await subjectService.claimSubject(selectedSubjectId, selectedClassId, user.id);
        toast.success("Subject Locked Successfully", { description: "You are now the primary faculty for this course." });
        checkSubjectLock();
    } catch (err: any) {
        toast.error("Claim Failed", { description: err.message });
    } finally {
        setIsClaiming(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = fuzzySearch(search, `${s.name} ${s.roll_number}`);
      const matchesBatch = selectedBatch === "all" || s.batch === selectedBatch;
      return matchesSearch && matchesBatch;
    });
  }, [search, selectedBatch, students]);

  const toggleAttendance = (id: string, type: 'present' | 'absent' | 'od') => {
    haptics.light();
    if (type === 'present') {
      setAbsentIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setOnDutyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setMedicalIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else if (type === 'absent') {
      setAbsentIds(prev => { const n = new Set(prev); n.add(id); return n; });
      setOnDutyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setMedicalIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setOnDutyIds(prev => { const n = new Set(prev); n.add(id); return n; });
      setAbsentIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setMedicalIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const setMedical = (id: string) => {
    setMedicalIds(prev => { const n = new Set(prev); n.add(id); return n; });
    setAbsentIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setOnDutyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const markAllPresent = () => {
    const newAbsent = new Set(absentIds);
    const newOD = new Set(onDutyIds);
    
    // Only remove statuses for the students currently in the filtered view
    filteredStudents.forEach(s => {
      newAbsent.delete(s.id);
      newOD.delete(s.id);
    });
    
    setAbsentIds(newAbsent);
    setOnDutyIds(newOD);
    toast.success(`Marked ${filteredStudents.length} students as present`);
  };

  const handleSave = async () => {
    if (!selectedClassId) return toast.error("Select a class registry first");
    
    setIsSaving(true);
    try {
      // 1. Determine target periods (handle Double Lectures)
      const periods = selectedLecture.startsWith('DP') 
        ? (selectedLecture === 'DP1' ? [1, 2] : [3, 4])
        : [parseInt(selectedLecture.replace('L', ''))];

      // 2. Map all students to status format (IST Aware)
      const formattedDate = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const attendanceData: any[] = [];

      periods.forEach(period => {
          students.forEach(student => {
              let status = 'present';
              if (absentIds.has(student.id)) status = 'absent';
              else if (onDutyIds.has(student.id)) status = 'od';
              else if (medicalIds.has(student.id)) status = 'ml';
              
              attendanceData.push({
                  studentId: student.id,
                  status,
                  period
              });
          });
      });

      // 3. Batch Sync to Supabase
      await academicService.saveAttendance(selectedClassId, formattedDate, attendanceData, selectedSubjectId);

      toast.success("Academic Sheet Synchronized", {
          description: `Logged attendance for ${periods.length} sessions across ${students.length} students.`
      });
      
      setIsConfirmOpen(false);
      // Optional: Clear selection to prevent accidental double-click pollution
      setAbsentIds(new Set());
      setOnDutyIds(new Set());
    } catch (err: any) {
        console.error("Sync Error:", err);
        
        // Attempt Offline ROPE Persistence
        const draftId = await offlineService.saveDraft({
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            lecture: selectedLecture,
            date: format(date, "yyyy-MM-dd"), // Simplified for draft
            absentIds: Array.from(absentIds),
            onDutyIds: Array.from(onDutyIds)
        });

        if (draftId) {
             toast.warning("Institutional Offline Mode", {
                description: "Cloud unreachable. Session securely buffered in local vault.",
                icon: <WifiOff className="w-5 h-5" />
            });
            setIsConfirmOpen(false);
            setAbsentIds(new Set());
            setOnDutyIds(new Set());
        } else {
            toast.error("Cloud Synchronization Failed", {
                description: err.message || "Database cluster unreachable. Check connectivity."
            });
        }
    } finally {
        setIsSaving(false);
    }
  };

  const totalStudents = students.length;
  const presentCount = totalStudents - absentIds.size - onDutyIds.size;
  const isAllPresent = absentIds.size === 0;

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Header
          title={
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-semibold text-xl tracking-tight">Mark Attendance</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
              <span className="text-slate-500 text-sm font-medium">
                {classes.find(c => c.id === selectedClassId)?.name || "Select Class"}
              </span>
            </div>
          }
        />

        <div className="flex-1 overflow-hidden flex flex-col pt-6 pb-24 px-4 md:px-0">
          {/* Controls Bar - Scrollable on small tablets */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 overflow-x-auto custom-scrollbar no-scrollbar text-sm font-medium">
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <Select value={selectedClassId} onValueChange={(val) => val && setSelectedClassId(val)}>
                <SelectTrigger className="w-[180px] md:w-[200px] h-12 border-slate-200 bg-white shadow-sm font-bold rounded-xl text-slate-700">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name} {cls.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBatch} onValueChange={(val) => val && setSelectedBatch(val)}>
                <SelectTrigger className="w-[110px] md:w-[120px] h-12 border-slate-200 bg-white shadow-sm font-bold rounded-xl text-slate-700">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="A">Batch A</SelectItem>
                  <SelectItem value="B">Batch B</SelectItem>
                  <SelectItem value="C">Batch C</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLecture} onValueChange={(val) => val && setSelectedLecture(val)}>
                <SelectTrigger className="w-[160px] md:w-[180px] h-12 border-slate-200 bg-white shadow-sm font-bold rounded-xl text-slate-700">
                  <SelectValue placeholder="Select Lecture" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 bg-white p-1">
                  <SelectItem value="L1">Lecture 1</SelectItem>
                  <SelectItem value="L2">Lecture 2</SelectItem>
                  <SelectItem value="L3">Lecture 3</SelectItem>
                  <SelectItem value="DP1">Lecture 1 + 2 (Double)</SelectItem>
                  <SelectItem value="DP2">Lecture 3 + 4 (Double)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSubjectId} onValueChange={(val) => val && setSelectedSubjectId(val)}>
                <SelectTrigger className="w-[180px] md:w-[220px] h-12 border-slate-200 bg-white shadow-sm font-bold rounded-xl text-slate-700">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subjects.length > 0 ? (
                    subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-xs font-bold text-slate-400">No subjects mapped</div>
                  )}
                </SelectContent>
              </Select>

              {selectedSubjectId && !currentAssignment && (
                <Button 
                    variant="outline" 
                    size="sm"
                    className="h-12 px-6 rounded-2xl border-blue-200 bg-blue-50 text-blue-700 font-black uppercase tracking-widest hover:bg-blue-100 transition-all gap-2"
                    onClick={handleClaim}
                    disabled={isClaiming}
                >
                    <UserCheck className="w-4 h-4" />
                    Lock Subject
                </Button>
              )}

              {currentAssignment && (
                <div className="h-12 px-6 rounded-2xl border-emerald-100 bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Verification Locked
                </div>
              )}

              <Popover>
                <PopoverTrigger
                  className={cn("h-12 border border-slate-200 bg-white hover:bg-slate-50 shadow-sm font-bold rounded-2xl text-left px-4 w-[180px] md:w-[200px] text-slate-800 transition-colors inline-flex items-center shrink-0")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm font-bold gap-2 shrink-0 hidden md:flex"
                onClick={() => {
                  try {
                    const doc = new jsPDF() as any;
                    const classInfo = classes.find((c) => c.id === selectedClassId);
                    const timestamp = format(new Date(), 'dd-MMM-yyyy HH:mm');

                    // 1. Institutional Header
                    doc.setFontSize(22);
                    doc.setTextColor(15, 23, 42); 
                    doc.text("ATTENDEX INSTITUTIONAL LEDGER", 105, 20, { align: "center" });
                    doc.setFontSize(10);
                    doc.setTextColor(148, 163, 184); 
                    doc.text(`Generated on: ${timestamp}`, 105, 28, { align: "center" });

                    // 2. Class Coordinates
                    doc.setDrawColor(241, 245, 249);
                    doc.line(14, 35, 196, 35);
                    doc.setFontSize(14);
                    doc.setTextColor(30, 41, 59);
                    doc.text(`Class: ${classInfo?.name || "All Sections"}`, 14, 45);
                    doc.text(`Date: ${format(date, "MMMM d, yyyy")}`, 14, 52);
                    doc.text(`Period: ${selectedLecture.replace("L", "Lecture ")}`, 14, 59);

                    // 3. Data Table
                    const tableData = students.map((s) => [
                        s.roll_number,
                        s.name,
                        s.email || "N/A",
                        absentIds.has(s.id) ? "ABSENT" : "PRESENT",
                    ]);

                    (doc as any).autoTable({
                        startY: 70,
                        head: [["Reg No.", "Student Name", "Official Email", "Status"]],
                        body: tableData,
                        theme: "grid",
                        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
                        styles: { fontSize: 9, cellPadding: 4 },
                        didParseCell: (data: any) => {
                            if (data.section === 'body' && data.column.index === 3) {
                                if (data.cell.raw === 'ABSENT') data.cell.styles.textColor = [225, 29, 72];
                                else data.cell.styles.textColor = [5, 150, 105];
                            }
                        }
                    });

                    // 4. Verification Footer
                    const finalY = (doc as any).lastAutoTable.finalY + 30;
                    doc.text("Authority Signature: __________________________", 14, finalY);
                    doc.rect(160, finalY, 30, 30);

                    doc.save(`Attendance_Ledger_${classInfo?.name || "Class"}.pdf`);
                    toast.success("Institutional Ledger Generated");
                  } catch (err) {
                    toast.error("Export failure");
                  }
                }}
              >
                <Download className="w-5 h-5 text-slate-500" />
                Export Ledger
              </Button>

              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger render={
                  <Button className="h-12 px-6 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2 border-none active:scale-95">
                    <CheckCircle2 className="w-5 h-5" />
                    Finalize Sync
                  </Button>
                } />
                <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
                  <div className="p-10">
                    <DialogHeader className="mb-8">
                      <DialogTitle className="text-3xl font-black tracking-tight">Confirm Sync</DialogTitle>
                      <DialogDescription className="text-slate-500 font-bold text-base mt-2">
                        Review attendance for <strong>Lecture 1</strong> before pushing to MSG91 gateway.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-5 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 text-center">
                          <div className="text-3xl font-black text-emerald-700">{filteredStudents.length - absentIds.size - onDutyIds.size}</div>
                          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mt-1">Present</div>
                        </div>
                        <div className="p-5 rounded-[2rem] bg-red-50 border-2 border-red-100 text-center">
                          <div className="text-3xl font-black text-red-700">{absentIds.size}</div>
                          <div className="text-[10px] font-black text-red-600 uppercase tracking-wider mt-1">Absent</div>
                        </div>
                        <div className="p-5 rounded-[2rem] bg-blue-50 border-2 border-blue-100 text-center">
                          <div className="text-3xl font-black text-blue-700">{onDutyIds.size}</div>
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider mt-1">OD</div>
                        </div>
                      </div>

                      <div className="p-6 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900">Cloud SMS Broadcast</p>
                            <p className="text-sm font-bold text-slate-400">{absentIds.size} parents will be notified</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t-2 border-slate-200/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast Preview</p>
                          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-600 italic leading-relaxed shadow-sm">
                            "Attendex Notice: Student (Reg No. {Array.from(absentIds)[0] || '...'}) was ABSENT for Lect. {selectedLecture.replace('L', '')} on {format(date, 'MMM d')}. Please acknowledge."
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 pt-0 flex flex-col gap-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-16 w-full rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCcw className="w-6 h-6 animate-spin" />
                          Pushing to Cloud...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          Execute Sync
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 w-full rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel Transaction
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative w-full lg:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 w-full border-slate-200 bg-white shadow-sm rounded-2xl focus-visible:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between py-4 px-1 mb-2">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2", isAllPresent ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                {isAllPresent ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> All Present</span>
                ) : (
                  <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {absentIds.size} Absent</span>
                )}
              </Badge>
              {!isAllPresent && (
                <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> {filteredStudents.length - absentIds.size - onDutyIds.size} Present</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /> {onDutyIds.size} OD</span>
                </div>
              )}
            </div>

            {!isAllPresent && (
              <button onClick={markAllPresent} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 hover:bg-blue-50 rounded-xl">
                Mark all present
              </button>
            )}
          </div>

          {/* Main List Container - Using a double-wrapper for perfect clipping */}
          <Card className="flex-1 rounded-[2rem] overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">

              {/* Fast Entry & Grid Toggle - Sticky at the absolute top of the scroll container */}
              <div className="p-6 border-b border-slate-100 bg-white flex flex-col gap-6 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fast Marking Mode</h4>
                    <p className="text-xs text-slate-500 mt-1">Touch-optimized for rapid entry</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                      onClick={() => setEntryMode('list')}
                      className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all", entryMode === 'list' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600")}
                    >List</button>
                    <button
                      onClick={() => setEntryMode('grid')}
                      className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all", entryMode === 'grid' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600")}
                    >Grid</button>
                  </div>
                </div>

                {entryMode === 'list' ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      placeholder="Type absent roll numbers (e.g. 02, 05)..."
                      className="flex-1 bg-white h-12 text-sm rounded-2xl border-slate-200 font-medium px-5"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          if (!val.trim()) return;
                          const rolls = val.split(',').map(r => r.trim().toLowerCase());
                          const newAbsent = new Set(absentIds);
                          students.forEach(s => {
                            const rollNum = s.roll_number || s.rollNumber || "";
                            if (!rollNum) return;
                            const simpleRoll = rollNum.slice(-4).toLowerCase();
                            if (rolls.includes(rollNum.toLowerCase()) || rolls.includes(simpleRoll)) {
                              newAbsent.add(s.id);
                            }
                          });
                          setAbsentIds(newAbsent);
                          (e.target as HTMLInputElement).value = '';
                          toast.success("Absentees updated!");
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 animate-in fade-in zoom-in-95 duration-300">
                    {students.map((s) => {
                      const isAbsent = absentIds.has(s.id);
                      const isOD = onDutyIds.has(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleAttendance(s.id, isAbsent ? 'present' : 'absent')}
                          className={cn(
                            "h-14 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center shadow-sm active:scale-95",
                            isAbsent ? "bg-red-500 text-white border-red-600 shadow-sm" :
                              isOD ? "bg-blue-500 text-white border-blue-600 shadow-sm" :
                                "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {s.roll_number.slice(-4)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Sub-Header (Student Information) - Sticky relative to the top container */}
              <div className="border-b border-slate-100 bg-slate-50/95 backdrop-blur-sm sticky top-[var(--header-offset,154px)] lg:top-[var(--lg-header-offset,122px)] z-40 px-8 py-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex-1">Student Information</div>
                <div className="w-[180px] text-center">Status Action</div>
              </div>

              <div className="divide-y divide-slate-100 relative">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, i) => {
                    const isAbsent = absentIds.has(student.id);
                    const isOD = onDutyIds.has(student.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.02 }}
                        key={student.id}
                        className={cn(
                          "group px-8 py-5 flex items-center justify-between transition-colors",
                          isAbsent && "bg-red-50/40 hover:bg-red-50/60",
                          isOD && "bg-blue-50/40 hover:bg-blue-50/60",
                          !isAbsent && !isOD && "hover:bg-slate-50/50"
                        )}
                      >
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all border shrink-0 shadow-sm",
                            isAbsent ? "bg-red-100 text-red-600 border-red-200" :
                              isOD ? "bg-blue-100 text-blue-600 border-blue-200" :
                                "bg-slate-50 text-slate-600 border-slate-100 group-hover:bg-white"
                          )}>
                            {student.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className={cn("font-bold text-base transition-colors flex items-center gap-3 truncate",
                              isAbsent ? "text-red-900" :
                                isOD ? "text-blue-900" : "text-slate-900"
                            )}>
                              {student.name}
                              {student.attendance < 75 && (
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                                  Risk
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-1">
                              {student.rollNumber}
                              <span className="text-slate-200">/</span>
                              <span className={cn(student.attendance < 75 ? "text-amber-600" : "text-slate-500")}>
                                {student.attendance}% Attendance
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shrink-0">
                          <button
                            onClick={() => toggleAttendance(student.id, 'present')}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                              !isAbsent && !isOD
                                ? "bg-white text-emerald-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            P
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, 'absent')}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                              isAbsent
                                ? "bg-white text-red-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            A
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, 'od')}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                              isOD
                                ? "bg-white text-blue-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            OD
                          </button>
                          <button
                            onClick={() => setMedical(student.id)}
                            className={cn(
                              "w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                              medicalIds.has(student.id)
                                ? "bg-white text-amber-600 shadow-sm scale-105"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            ML
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredStudents.length === 0 && (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
                      <Search className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-black text-slate-900 uppercase tracking-tight">No match found</p>
                    <p className="text-sm font-bold text-slate-400 mt-2">Try a different roll number or name</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Hidden Dialog for Confirmation logic removed from fixed bar to trigger above */}


        <StudentProfile
          student={selectedStudent}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </PageTransition>
  );
}

// Inline component since not set up in shadcn ui yet
function Badge({ children, variant = "default", className, ...props }: any) {
  return <span className={cn("inline-flex items-center justify-center", className)} {...props}>{children}</span>;
}
