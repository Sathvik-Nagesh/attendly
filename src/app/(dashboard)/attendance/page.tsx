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
import { Search, CalendarIcon, CheckCircle2, AlertCircle, Bell, Download } from "lucide-react";
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

        <div className="flex-1 overflow-hidden flex flex-col pt-6 pb-24">
          {/* Controls Bar */}
          <div className="flex items-center justify-between pb-6">
            <div className="flex items-center gap-4">
              <Select defaultValue="cs101">
                <SelectTrigger className="w-[200px] h-10 border-slate-200 bg-white shadow-sm font-medium rounded-xl">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs101">Computer Science 101</SelectItem>
                  <SelectItem value="phy202">Physics 202</SelectItem>
                  <SelectItem value="eng303">English Lit 303</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBatch} onValueChange={(val) => val && setSelectedBatch(val)}>
                <SelectTrigger className="w-[120px] h-10 border-slate-200 bg-white shadow-sm font-medium rounded-xl">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="A">Batch A</SelectItem>
                  <SelectItem value="B">Batch B</SelectItem>
                  <SelectItem value="C">Batch C</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLecture} onValueChange={(val) => val && setSelectedLecture(val)}>
                <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white shadow-sm font-semibold rounded-xl text-slate-700">
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
                  className={cn("h-10 border border-slate-200 bg-white hover:bg-slate-50 shadow-sm font-medium rounded-xl text-left px-4 w-[200px] text-slate-800 transition-colors inline-flex items-center")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                className="h-10 rounded-xl border-slate-200 bg-white shadow-sm font-semibold gap-2"
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,Roll Number,Name,Status,Date\nCS-01,Alena Smith,Present,2023-10-10\nCS-02,Brandon Cooper,Absent,2023-10-10";
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `attendance_${format(date, 'yyyy-MM-dd')}_L1.csv`);
                  document.body.appendChild(link);
                  link.click();
                  toast.success("CSV Downloaded!", {
                    description: "Attendance ledger for today is ready."
                  });
                }}
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-[300px] border-slate-200 bg-white shadow-sm rounded-xl focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between py-3 px-1 mb-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", isAllPresent ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600")}>
                {isAllPresent ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> All Present</span>
                ) : (
                  <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {absentIds.size} Absent</span>
                )}
              </Badge>
            </div>
            
            {!isAllPresent && (
              <button onClick={markAllPresent} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Mark all present
              </button>
            )}
          </div>

          {/* Main List */}
          <Card className="flex-1 overflow-auto bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col">
            
            {/* Fast Entry & Grid Toggle */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Fast Marking Mode</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Optimized for physical registers</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setEntryMode('list')}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", entryMode === 'list' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400")}
                  >List</button>
                  <button 
                    onClick={() => setEntryMode('grid')}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", entryMode === 'grid' ? "bg-slate-900 text-white shadow-sm" : "text-slate-400")}
                  >Quick Grid</button>
                </div>
              </div>

              {entryMode === 'list' ? (
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Type absent roll numbers (e.g. CS-02, CS-05)..." 
                    className="flex-1 bg-white h-10 text-sm rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value;
                        if (!val.trim()) return;
                        const rolls = val.split(',').map(r => r.trim().toLowerCase());
                        const newAbsent = new Set(absentIds);
                        MOCK_STUDENTS.forEach(s => {
                          if (rolls.includes(s.rollNumber.toLowerCase())) {
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
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                  {MOCK_STUDENTS.map((s) => {
                    const isAbsent = absentIds.has(s.id);
                    const isOD = onDutyIds.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleAttendance(s.id, isAbsent ? 'present' : 'absent')}
                        className={cn(
                          "h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center",
                          isAbsent ? "bg-red-500 text-white border-red-600 shadow-sm" : 
                          isOD ? "bg-blue-500 text-white border-blue-600 shadow-sm" :
                          "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {s.rollNumber.split('-')[1]}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="min-w-full inline-block align-middle flex-1">
              <div className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex-1">Student</div>
                <div className="w-[120px] text-right">Attendance</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredStudents.map((student, i) => {
                    const isAbsent = absentIds.has(student.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        key={student.id}
                        className={cn(
                          "group px-6 py-4 flex items-center justify-between transition-colors hover:bg-slate-50/80",
                          absentIds.has(student.id) && "bg-red-50/30 hover:bg-red-50/50",
                          onDutyIds.has(student.id) && "bg-blue-50/30 hover:bg-blue-50/50"
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors border",
                            absentIds.has(student.id) ? "bg-red-100 text-red-600 border-red-200" : 
                            onDutyIds.has(student.id) ? "bg-blue-100 text-blue-600 border-blue-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {student.avatar}
                          </div>
                          <div>
                            <div className={cn("font-medium transition-colors flex items-center gap-2", 
                              absentIds.has(student.id) ? "text-red-900" : 
                              onDutyIds.has(student.id) ? "text-blue-900" : "text-slate-900"
                            )}>
                              {student.name}
                              {student.attendance < 75 && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded leading-none border border-amber-200">
                                  Defaulter
                                </span>
                              )}
                              {onDutyIds.has(student.id) && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded leading-none border border-blue-200">
                                  On-Duty
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              {student.rollNumber}
                              <span className="text-slate-300">•</span>
                              <span>{student.attendance}% Overall</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => toggleAttendance(student.id, 'present')}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                              !absentIds.has(student.id) && !onDutyIds.has(student.id) 
                                ? "bg-white text-emerald-600 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            P
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, 'absent')}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                              absentIds.has(student.id) 
                                ? "bg-white text-red-600 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            A
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, 'od')}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                              onDutyIds.has(student.id) 
                                ? "bg-white text-blue-600 shadow-sm" 
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
                  <div className="py-16 text-center text-slate-500">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">No students found</p>
                    <p className="text-xs">Try adjusting your search query</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>


          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</span>
                <span className="text-xl font-bold text-emerald-600">
                  {filteredStudents.length - absentIds.size - onDutyIds.size}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</span>
                <span className="text-xl font-bold text-red-600">{absentIds.size}</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OD</span>
                <span className="text-xl font-bold text-blue-600">{onDutyIds.size}</span>
              </div>
            </div>
            
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger className="h-12 px-8 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer outline-none">
                <CheckCircle2 className="w-5 h-5" />
                Save Attendance
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden bg-white border border-slate-200 text-slate-900">
                <div className="p-8">
                  <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-bold">Confirm Attendance</DialogTitle>
                    <DialogDescription className="text-slate-500">
                      You are about to finalize the attendance for <strong>Lecture 1</strong>.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                         <div className="text-2xl font-bold text-emerald-700">{filteredStudents.length - absentIds.size - onDutyIds.size}</div>
                         <div className="text-[10px] font-bold text-emerald-600 uppercase">Present</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                         <div className="text-2xl font-bold text-red-700">{absentIds.size}</div>
                         <div className="text-[10px] font-bold text-red-600 uppercase">Absent</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                         <div className="text-2xl font-bold text-blue-700">{onDutyIds.size}</div>
                         <div className="text-[10px] font-bold text-blue-600 uppercase">OD</div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                             <Bell className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-semibold">SMS Notifications</p>
                             <p className="text-xs text-slate-500">{absentIds.size} messages will be sent</p>
                          </div>
                       </div>
                       <div className="pt-3 border-t border-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Message Preview</p>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 italic leading-relaxed">
                            "Dear Parent, your ward was absent for <strong>{selectedLecture.startsWith('DP') ? (selectedLecture === 'DP1' ? 'Lectures 1 & 2' : 'Lectures 3 & 4') : 'Lecture ' + selectedLecture.replace('L', '')}</strong> today, {format(date, 'dd MMM')}. Regards, Attendly."
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 flex flex-col gap-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-12 w-full rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? "Syncing with MSG91..." : "Complete Sync & Send SMS"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-10 w-full rounded-xl text-slate-500 font-medium"
                    onClick={() => setIsConfirmOpen(false)}
                  >
                    Go Back and Edit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>

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
