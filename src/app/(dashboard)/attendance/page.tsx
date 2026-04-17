"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/ui/page-transition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, WifiOff, CheckCircle2, CalendarIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { offlineService } from "@/services/offline";
import { haptics } from "@/lib/haptics";
import { toast } from "sonner";
import { cn, fuzzySearch } from "@/lib/utils";
import { StudentProfile } from "@/components/students/student-profile";
import { academicService } from "@/services/academic";
import { subjectService, Subject } from "@/services/subjects";
import { supabase } from "@/lib/supabase";
import { AttendanceStats } from "@/components/attendance/attendance-stats";
import { StudentList } from "@/components/attendance/student-list";
import { AttendanceSyncDialog } from "@/components/attendance/sync-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useStudents, useClasses } from "@/hooks/use-academic";
import { TableRowSkeleton } from "@/components/ui/skeletons";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";


export default function AttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedLecture, setSelectedLecture] = useState("L1");
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [entryMode, setEntryMode] = useState<'list' | 'grid'>('list');
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [onDutyIds, setOnDutyIds] = useState<Set<string>>(new Set());
  const [medicalIds, setMedicalIds] = useState<Set<string>>(new Set());
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const router = useRouter();

  // Queries
  const { data: classes = [], isLoading: classesLoading, refetch: refetchClasses } = useClasses();

  const { data: students = [], isLoading: studentsLoading, refetch: refetchStudents } = useStudents(selectedClassId);

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: async () => {
      const currentClass = classes.find((c: any) => c.id === selectedClassId);
      if (!currentClass) return [];
      return subjectService.getSubjects({ 
        department: currentClass.department, 
        year: currentClass.year,
        semester: 1 
      });
    },
    enabled: !!selectedClassId && classes.length > 0,
  });

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const handleRefresh = async () => {
    await Promise.all([refetchClasses(), refetchStudents()]);
    toast.success("Institutional Records Synced");
  };


  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', selectedClassId],
    queryFn: () => subjectService.getAssignmentsForClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  const currentAssignment = useMemo(() => {
    return assignments.find((a: any) => a.subject_id === selectedSubjectId) || null;
  }, [assignments, selectedSubjectId]);

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");
      return subjectService.claimSubject(selectedSubjectId, selectedClassId, user.id);
    },
    onSuccess: () => {
      toast.success("Subject Locked Successfully", { description: "You are now the primary faculty for this course." });
      queryClient.invalidateQueries({ queryKey: ['assignments', selectedClassId] });
    },
    onError: (err: any) => toast.error("Claim Failed", { description: err.message }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const periods = selectedLecture.startsWith('DP') 
        ? (selectedLecture === 'DP1' ? [1, 2] : [3, 4])
        : [parseInt(selectedLecture.replace('L', ''))];

      const formattedDate = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const attendanceData: any[] = [];

      periods.forEach(period => {
          students.forEach((student: any) => {
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

      return academicService.saveAttendance(selectedClassId, formattedDate, attendanceData, selectedSubjectId);
    },
    onSuccess: (_, variables, context) => {
      const periodsCount = selectedLecture.startsWith('DP') ? 2 : 1;
      toast.success("Academic Sheet Synchronized", {
          description: `Logged attendance for ${periodsCount} sessions across ${students.length} students.`
      });
      setIsConfirmOpen(false);
      setAbsentIds(new Set());
      setOnDutyIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: async (err: any) => {
        const draftId = await offlineService.saveDraft({
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            lecture: selectedLecture,
            date: format(date, "yyyy-MM-dd"),
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
    }
  });

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

  const loading = classesLoading || studentsLoading || subjectsLoading;
  const isClaiming = claimMutation.isPending;
  const isSaving = saveMutation.isPending;
  const handleClaim = () => claimMutation.mutate();
  const handleSave = () => saveMutation.mutate();

  if (loading) return <LoadingScreen />;

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
    filteredStudents.forEach(s => {
      newAbsent.delete(s.id);
      newOD.delete(s.id);
    });
    setAbsentIds(newAbsent);
    setOnDutyIds(newOD);
    toast.success(`Marked ${filteredStudents.length} students as present`);
  };



  const stats = {
    present: students.length - absentIds.size - onDutyIds.size,
    absent: absentIds.size,
    od: onDutyIds.size
  };

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
                <SelectContent className="rounded-xl">
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
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>

              <AttendanceSyncDialog 
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onSync={handleSave}
                isSaving={isSaving}
                stats={stats}
                lecture={selectedLecture}
                date={date}
                sampleAbsentRoll={students.find(s => absentIds.has(s.id))?.roll_number}
              />
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

          <AttendanceStats 
            total={students.length}
            absent={absentIds.size}
            od={onDutyIds.size}
            onMarkAllPresent={markAllPresent}
          />

          <Card className="flex-1 rounded-[2rem] overflow-hidden bg-white border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
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
                          {s.roll_number?.slice(-4)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-100 bg-slate-50/95 backdrop-blur-sm sticky top-[154px] lg:top-[122px] z-40 px-8 py-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex-1">Student Information</div>
                <div className="w-[180px] text-center">Status Action</div>
              </div>

              <StudentList 
                students={filteredStudents}
                absentIds={absentIds}
                onDutyIds={onDutyIds}
                medicalIds={medicalIds}
                onToggle={toggleAttendance}
                onMedical={setMedical}
              />
            </div>
          </Card>



        </div>

        <StudentProfile
          student={selectedStudent}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>
    </PageTransition>
  );
}

function Badge({ children, variant = "default", className, ...props }: any) {
  return <span className={cn("inline-flex items-center justify-center", className)} {...props}>{children}</span>;
}
