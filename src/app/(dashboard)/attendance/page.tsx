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
import { Search, CalendarIcon, CheckCircle2, AlertCircle, Bell, Download, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn, fuzzySearch } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "@/components/students/student-profile";

const MOCK_STUDENTS = [
  { id: "1", name: "Alena Smith", rollNumber: "CS-01", avatar: "AS", attendance: 92, batch: "A" },
  { id: "2", name: "Brandon Cooper", rollNumber: "CS-02", avatar: "BC", attendance: 68, batch: "A" },
  { id: "3", name: "Cynthia Davis", rollNumber: "CS-03", avatar: "CD", attendance: 85, batch: "B" },
  { id: "4", name: "Derek Evans", rollNumber: "CS-04", avatar: "DE", attendance: 72, batch: "B" },
  { id: "5", name: "Elena Ford", rollNumber: "CS-05", avatar: "EF", attendance: 95, batch: "A" },
  { id: "6", name: "Fiona Garcia", rollNumber: "CS-06", avatar: "FG", attendance: 88, batch: "B" },
  { id: "7", name: "George Harris", rollNumber: "CS-07", avatar: "GH", attendance: 61, batch: "A" },
  { id: "8", name: "Hannah Iles", rollNumber: "CS-08", avatar: "HI", attendance: 99, batch: "B" },
];

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [entryMode, setEntryMode] = useState<'list' | 'grid'>('list');
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [onDutyIds, setOnDutyIds] = useState<Set<string>>(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState("L1");

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => {
      const matchesSearch = fuzzySearch(search, `${s.name} ${s.rollNumber}`);
      const matchesBatch = selectedBatch === "all" || s.batch === selectedBatch;
      return matchesSearch && matchesBatch;
    });
  }, [search, selectedBatch]);

  const toggleAttendance = (id: string, type: 'present' | 'absent' | 'od') => {
    if (type === 'present') {
      setAbsentIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setOnDutyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else if (type === 'absent') {
      setAbsentIds(prev => { const n = new Set(prev); n.add(id); return n; });
      setOnDutyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      setOnDutyIds(prev => { const n = new Set(prev); n.add(id); return n; });
      setAbsentIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const markAllPresent = () => {
    setAbsentIds(new Set());
    setOnDutyIds(new Set());
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API Call to MSG91
    console.log("-----------------------------------------");
    console.log("MSG91 API GATEWAY: Initiating Sync");
    console.log(`Payload: { type: 'absent_alert', count: ${absentIds.size}, recipients: [${Array.from(absentIds).join(', ')}] }`);

    setTimeout(() => {
      console.log("MSG91 RESPONSE: 200 OK - Message Sent Successfully");
      console.log("-----------------------------------------");

      setIsSaving(false);
      setIsConfirmOpen(false);
      toast.success("Attendance synced successfully!", {
        description: `${absentIds.size} parents notified via MSG91 SMS Gateway.`
      });
      setAbsentIds(new Set());
      setOnDutyIds(new Set());
    }, 2000);
  };

  const presentCount = MOCK_STUDENTS.length - absentIds.size - onDutyIds.size;
  const isAllPresent = absentIds.size === 0;

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <Header
          title={
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-semibold text-xl tracking-tight">Mark Attendance</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2" />
              <span className="text-slate-500 text-sm font-medium">Computer Science 101</span>
            </div>
          }
        />

        <div className="flex-1 overflow-hidden flex flex-col pt-6 pb-24 px-4 md:px-0">
          {/* Controls Bar - Scrollable on small tablets */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 overflow-x-auto custom-scrollbar no-scrollbar text-sm font-medium">
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <Select defaultValue="cs101">
                <SelectTrigger className="w-[180px] md:w-[200px] h-12 border-slate-200 bg-white shadow-sm font-bold rounded-xl text-slate-700">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="cs101">Computer Science 101</SelectItem>
                  <SelectItem value="phy202">Physics 202</SelectItem>
                  <SelectItem value="eng303">English Lit 303</SelectItem>
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
                  const csvContent = "data:text/csv;charset=utf-8,Roll Number,Name,Status,Date\nCS-01,Alena Smith,Present,2023-10-10\nCS-02,Brandon Cooper,Absent,2023-10-10";
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `attendance_${format(date, 'yyyy-MM-dd')}_L1.csv`);
                  document.body.appendChild(link);
                  link.click();
                  toast.success("CSV Downloaded!");
                }}
              >
                <Download className="w-5 h-5 text-slate-500" />
                Export
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
                            "Attendex Notice: Student (Roll {Array.from(absentIds)[0] || '...'}) was ABSENT for Lect. {selectedLecture.replace('L', '')} on {format(date, 'MMM d')}. Please acknowledge."
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
                          MOCK_STUDENTS.forEach(s => {
                            const simpleRoll = s.rollNumber.split('-')[1].toLowerCase();
                            if (rolls.includes(s.rollNumber.toLowerCase()) || rolls.includes(simpleRoll)) {
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
                    {MOCK_STUDENTS.map((s) => {
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
                          {s.rollNumber.split('-')[1]}
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
                              "w-12 h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center",
                              isOD
                                ? "bg-white text-blue-600 shadow-md shadow-blue-600/10 scale-105"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            OD
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
